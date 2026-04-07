const Attendance = require("../models/attendance.model");
const Member = require("../models/member.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");
const { AppError } = require("../utils/appError");

const markAttendance = asyncHandler(async (req, res) => {
  const { secretCode, action } = req.body;
  if (!secretCode) throw new AppError("Secret code is required", 400);

  // 1. Find member by secret code
  const member = await Member.findOne({ secretCode }).populate("user");
  if (!member) throw new AppError("Invalid secret code", 404);

  const today = new Date().toISOString().split("T")[0];
  const gymId = member.gymId;

  // 2. Check today's attendance
  let attendance = await Attendance.findOne({ member: member._id, date: today });

  if (!attendance) {
    // If user explicitly clicked check-out but hasn't checked in
    if (action === "check-out") {
      throw new AppError("You haven't checked in yet today.", 400);
    }

    // Case 1: Check-in
    attendance = await Attendance.create({
      gymId,
      member: member._id,
      date: today,
      checkIn: new Date(),
      status: "present"
    });
    
    if (req.app.locals.io) {
      req.app.locals.io.to(gymId).emit("attendance:update", { 
        type: "check-in", 
        member: member.user.name, 
        time: attendance.checkIn 
      });
    }

    return sendResponse(res, { 
      status: 201, 
      message: `Welcome, ${member.user.name}! Checked in successfully.`, 
      data: attendance 
    });
  }

  if (attendance.status === "present") {
    // If user explicitly clicked check-in but is already present
    if (action === "check-in") {
      throw new AppError("You are already checked in.", 400);
    }

    // Case 2: Check-out
    attendance.checkOut = new Date();
    attendance.status = "completed";
    await attendance.save();

    if (req.app.locals.io) {
      req.app.locals.io.to(gymId).emit("attendance:update", { 
        type: "check-out", 
        member: member.user.name, 
        time: attendance.checkOut 
      });
    }

    return sendResponse(res, { 
      message: `Goodbye, ${member.user.name}! Checked out successfully.`, 
      data: attendance 
    });
  }

  // Case 3: Already Completed
  throw new AppError("Attendance already completed for today", 400);
});

const checkIn = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const entry = await Attendance.create({
    gymId: req.gymId,
    member: req.body.member,
    date: today,
    faceRecognitionMatched: req.body.faceRecognitionMatched ?? null
  });
  if (req.app.locals.io) req.app.locals.io.to(req.gymId).emit("attendance:checkin", entry);
  sendResponse(res, { status: 201, message: "Checked in", data: entry });
});

const checkOut = asyncHandler(async (req, res) => {
  const entry = await Attendance.findOneAndUpdate(
    { _id: req.params.id, gymId: req.gymId },
    { checkOut: new Date(), status: "completed" },
    { new: true }
  );
  if (req.app.locals.io) req.app.locals.io.to(req.gymId).emit("attendance:checkout", entry);
  sendResponse(res, { message: "Checked out", data: entry });
});

const history = asyncHandler(async (req, res) => {
  const { skip, limit, page, search, date } = getPagination(req.query);
  
  const query = { gymId: req.gymId };
  if (date) query.date = date;

  // If search is provided, we need to filter by member name
  let memberIds = [];
  if (search) {
    const members = await Member.aggregate([
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDoc" } },
      { $unwind: "$userDoc" },
      { $match: { "userDoc.name": new RegExp(search, "i") } }
    ]);
    memberIds = members.map(m => m._id);
    query.member = { $in: memberIds };
  }

  const [items, total] = await Promise.all([
    Attendance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "member",
        populate: { path: "user", select: "name email phone" }
      }),
    Attendance.countDocuments(query)
  ]);

  sendResponse(res, { message: "Attendance history fetched", data: { items, page, limit, total } });
});

const faceVerifyPlaceholder = asyncHandler(async (req, res) => {
  const { member, imageRef } = req.body;
  sendResponse(res, {
    message: "Face recognition placeholder result",
    data: {
      member,
      imageRef: imageRef || null,
      matched: true,
      confidence: 0.88,
      provider: "placeholder"
    }
  });
});

module.exports = { markAttendance, checkIn, checkOut, history, faceVerifyPlaceholder };
