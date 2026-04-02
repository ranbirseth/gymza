const Member = require("../models/member.model");
const User = require("../models/user.model");
const Plan = require("../models/plan.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const calculateExpiry = (startDate, durationType) => {
  const expiry = new Date(startDate);
  expiry.setMonth(expiry.getMonth() + (durationType === "monthly" ? 1 : 12));
  return expiry;
};

const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, password, trainer, planId, membershipStartDate, branchCode = "MAIN" } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
  const gymId = req.gymId;

  const user = await User.create({ gymId, name, email, phone, password, role: "member", photo });
  
  let membershipExpiryDate = null;
  if (planId) {
    const plan = await Plan.findOne({ _id: planId, gymId });
    const start = membershipStartDate ? new Date(membershipStartDate) : new Date();
    if (plan) {
      membershipExpiryDate = calculateExpiry(start, plan.durationType);
    }
  }
  const member = await Member.create({
    gymId,
    user: user._id,
    trainer,
    currentPlan: planId || null,
    membershipStartDate: membershipStartDate || new Date(),
    membershipExpiryDate,
    isActivePlan: Boolean(planId),
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
    ? { $or: [{ "userDoc.name": new RegExp(query.search, "i") }, { "userDoc.email": new RegExp(query.search, "i") }] }
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
  member.membershipExpiryDate = calculateExpiry(startDate, plan.durationType);
  member.isActivePlan = true;
  await member.save();
  sendResponse(res, { message: "Plan assigned to member", data: member });
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

module.exports = { createMember, listMembers, searchMembers, getMember, updateMember, deleteMember, assignPlan, getMyProfile, updateMyProfile };
