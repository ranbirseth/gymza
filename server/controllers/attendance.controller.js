const Attendance = require("../models/attendance.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const checkIn = asyncHandler(async (req, res) => {
  const entry = await Attendance.create({
    gymId: req.gymId,
    member: req.body.member,
    faceRecognitionMatched: req.body.faceRecognitionMatched ?? null
  });
  if (req.app.locals.io) req.app.locals.io.to(req.gymId).emit("attendance:checkin", entry);
  sendResponse(res, { status: 201, message: "Checked in", data: entry });
});

const checkOut = asyncHandler(async (req, res) => {
  const entry = await Attendance.findOneAndUpdate({ _id: req.params.id, gymId: req.gymId }, { checkOut: new Date() }, { new: true });
  if (req.app.locals.io) req.app.locals.io.to(req.gymId).emit("attendance:checkout", entry);
  sendResponse(res, { message: "Checked out", data: entry });
});

const history = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Attendance.find({ gymId: req.gymId }).sort({ checkIn: -1 }).skip(skip).limit(limit).populate("member"),
    Attendance.countDocuments({ gymId: req.gymId })
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

module.exports = { checkIn, checkOut, history, faceVerifyPlaceholder };
