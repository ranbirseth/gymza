const Member = require("../models/member.model");
const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const calculateExpiry = (startDate, durationDays) => {
  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + parseInt(durationDays));
  return expiry;
};

const isPlanActive = (expiryDate, paymentStatus) => {
  return paymentStatus === "paid" && new Date() < new Date(expiryDate);
};

const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, password, trainer, planId, membershipStartDate, branchCode = "MAIN" } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
  const gymId = req.gymId;

  const user = await User.create({ gymId, name, email, phone, password, role: "member", photo });
  
  let membershipExpiryDate = null;
  let status = "pending";
  if (planId) {
    const plan = await Plan.findOne({ _id: planId, gymId });
    const start = membershipStartDate ? new Date(membershipStartDate) : new Date();
    if (plan) {
      membershipExpiryDate = calculateExpiry(start, plan.duration);
    }
  }
  const member = await Member.create({
    gymId,
    user: user._id,
    trainer,
    currentPlan: planId || null,
    membershipStartDate: membershipStartDate || new Date(),
    membershipExpiryDate,
    isActivePlan: false, // Becomes active only after payment
    status: "pending",
    paymentStatus: "pending",
    branchCode
  });
  sendResponse(res, { status: 201, message: "Member created", data: member });
});

const fetchMembers = async (query, gymId) => {
  const { skip, limit, page } = getPagination(query);
  const branchFilter = query.branchCode ? { branchCode: query.branchCode, gymId } : { gymId };
  
  // Status filter logic
  if (query.status && query.status !== "all") {
    branchFilter.status = query.status;
  }

  const q = query.search
    ? { 
        $or: [
          { "userDoc.name": new RegExp(query.search, "i") }, 
          { "userDoc.email": new RegExp(query.search, "i") },
          { "userDoc.phone": new RegExp(query.search, "i") }
        ] 
      }
    : {};
  const baseLookup = [
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDoc" } },
    { $unwind: "$userDoc" },
    { $lookup: { from: "users", localField: "trainer", foreignField: "_id", as: "trainerDoc" } },
    { $lookup: { from: "plans", localField: "currentPlan", foreignField: "_id", as: "planDoc" } }
  ];
  const filterStages = [{ $match: branchFilter }, ...(Object.keys(q).length ? [{ $match: q }] : [])];
  const pipeline = [
    ...baseLookup, 
    ...filterStages, 
    { $sort: { createdAt: -1 } }, 
    { $skip: skip }, 
    { $limit: limit },
    {
      $project: {
        _id: 1,
        gymId: 1,
        isActivePlan: 1,
        membershipExpiryDate: 1,
        status: 1,
        paymentStatus: 1,
        createdAt: 1,
        user: "$userDoc",
        trainer: { $arrayElemAt: ["$trainerDoc", 0] },
        currentPlan: { $arrayElemAt: ["$planDoc", 0] }
      }
    }
  ];
  const [items, totalObj] = await Promise.all([
    Member.aggregate(pipeline),
    Member.aggregate([...baseLookup, ...filterStages, { $count: "count" }])
  ]);
  return { items, page, limit, total: totalObj[0]?.count || 0 };
};

const listMembers = asyncHandler(async (req, res) => {
  const data = await fetchMembers(req.query, req.gymId);
  sendResponse(res, { message: "Members fetched", data });
});

const searchMembers = asyncHandler(async (req, res) => {
  const data = await fetchMembers({ ...req.query, search: req.query.q || "" }, req.gymId);
  sendResponse(res, { message: "Members search fetched", data });
});

const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId }).populate("user trainer currentPlan");
  if (!member) throw Object.assign(new Error("Member not found in your gym"), { statusCode: 404 });
  sendResponse(res, { message: "Member fetched", data: member });
});

const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found in your gym"), { statusCode: 404 });
  const { name, phone, email, password, ...memberPayload } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  if (name || phone || email || photo || password) {
    const userUpdate = { ...(name && { name }), ...(phone && { phone }), ...(email && { email }), ...(photo && { photo }), ...(password && { password }) };
    const user = await User.findById(member.user);
    if (user) {
      Object.assign(user, userUpdate);
      await user.save(); // Using save() instead of findByIdAndUpdate to trigger password hashing middleware
    }
  }
  Object.assign(member, memberPayload);
  await member.save();
  sendResponse(res, { message: "Member updated", data: await member.populate("user trainer currentPlan") });
});

const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found in your gym"), { statusCode: 404 });
  await User.findByIdAndDelete(member.user);
  sendResponse(res, { message: "Member deleted", data: {} });
});

const assignPlan = asyncHandler(async (req, res) => {
  const { planId, membershipStartDate } = req.body;
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found in your gym"), { statusCode: 404 });
  const plan = await Plan.findOne({ _id: planId, gymId: req.gymId });
  if (!plan) throw Object.assign(new Error("Plan not found in your gym"), { statusCode: 404 });
  const startDate = membershipStartDate ? new Date(membershipStartDate) : new Date();
  member.currentPlan = plan._id;
  member.membershipStartDate = startDate;
  member.membershipExpiryDate = calculateExpiry(startDate, plan.duration);
  member.isActivePlan = false; // Requires payment to become active
  member.paymentStatus = "pending";
  member.status = "pending";
  await member.save();
  sendResponse(res, { message: "Plan assigned to member. Awaiting payment.", data: member });
});

const renewPlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found in your gym"), { statusCode: 404 });
  
  const plan = await Plan.findOne({ _id: planId || member.currentPlan, gymId: req.gymId });
  if (!plan) throw Object.assign(new Error("Plan not found"), { statusCode: 404 });

  // If active, extend from current expiry. If expired, start from today.
  const isCurrentlyActive = member.status === "active" && member.membershipExpiryDate && new Date() < new Date(member.membershipExpiryDate);
  const startDate = isCurrentlyActive ? new Date(member.membershipExpiryDate) : new Date();
  
  member.membershipStartDate = startDate;
  member.membershipExpiryDate = calculateExpiry(startDate, plan.duration);
  member.currentPlan = plan._id;
  member.paymentStatus = "pending";
  member.status = "pending";
  member.isActivePlan = false;
  
  await member.save();
  sendResponse(res, { message: "Plan renewed. Awaiting payment.", data: member });
});

const upgradePlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found"), { statusCode: 404 });
  
  const plan = await Plan.findOne({ _id: planId, gymId: req.gymId });
  if (!plan) throw Object.assign(new Error("Plan not found"), { statusCode: 404 });

  // Upgrading usually starts from today
  const startDate = new Date();
  member.membershipStartDate = startDate;
  member.membershipExpiryDate = calculateExpiry(startDate, plan.duration);
  member.currentPlan = plan._id;
  member.paymentStatus = "pending";
  member.status = "pending";
  member.isActivePlan = false;

  await member.save();
  sendResponse(res, { message: "Plan upgraded. Awaiting payment.", data: member });
});

const cancelPlan = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found"), { statusCode: 404 });
  
  member.status = "cancelled";
  member.isActivePlan = false;
  await member.save();
  sendResponse(res, { message: "Subscription cancelled", data: member });
});

const freezePlan = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member || member.status !== "active") throw Object.assign(new Error("Only active members can freeze plans"), { statusCode: 400 });
  
  const now = new Date();
  const expiry = new Date(member.membershipExpiryDate);
  const diffTime = expiry - now;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (remainingDays <= 0) throw Object.assign(new Error("Cannot freeze an expired plan"), { statusCode: 400 });
  
  member.status = "frozen";
  member.isActivePlan = false;
  member.frozenAt = now;
  member.remainingDays = remainingDays;
  await member.save();
  
  sendResponse(res, { message: "Plan frozen successfully", data: member });
});

const resumePlan = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member || member.status !== "frozen") throw Object.assign(new Error("Only frozen plans can be resumed"), { statusCode: 400 });
  
  const now = new Date();
  member.status = "active";
  member.isActivePlan = true;
  member.membershipExpiryDate = calculateExpiry(now, member.remainingDays);
  member.frozenAt = null;
  member.remainingDays = null;
  await member.save();
  
  sendResponse(res, { message: "Plan resumed successfully", data: member });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id, gymId: req.gymId }).populate("user trainer currentPlan");
  if (!member) throw Object.assign(new Error("Member profile not found"), { statusCode: 404 });
  sendResponse(res, { message: "Profile fetched", data: member });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const payload = {};
  ["name", "phone", "email"].forEach((k) => {
    if (req.body[k] !== undefined) payload[k] = req.body[k];
  });
  if (req.file) payload.photo = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, payload);
  const member = await Member.findOne({ user: req.user._id, gymId: req.gymId }).populate("user trainer currentPlan");
  sendResponse(res, { message: "Profile updated", data: member });
});

const approveMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw Object.assign(new Error("Member not found"), { statusCode: 404 });
  
  member.status = "active";
  await member.save();

  // Also ensure User document is active (though it defaults to active)
  await User.findByIdAndUpdate(member.user, { status: "active" });
  
  sendResponse(res, { message: "Member approved successfully", data: member });
});

module.exports = { 
  createMember, 
  listMembers, 
  searchMembers, 
  getMember, 
  updateMember, 
  deleteMember, 
  assignPlan, 
  renewPlan,
  upgradePlan,
  cancelPlan,
  freezePlan,
  resumePlan,
  approveMember,
  getMyProfile, 
  updateMyProfile 
};
