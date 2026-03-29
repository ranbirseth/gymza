const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const listTrainers = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const query = { gymId: req.gymId, role: "trainer", ...(req.query.search ? { name: new RegExp(req.query.search, "i") } : {}) };
  const [items, total] = await Promise.all([
    User.find(query).select("-password -refreshTokens").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);
  sendResponse(res, { message: "Trainers fetched", data: { items, total, page, limit } });
});

const createTrainer = asyncHandler(async (req, res) => {
  const trainer = await User.create({ ...req.body, gymId: req.gymId, role: "trainer" });
  sendResponse(res, {
    status: 201,
    message: "Trainer created",
    data: { _id: trainer._id, name: trainer.name, email: trainer.email, phone: trainer.phone, role: trainer.role }
  });
});

module.exports = { listTrainers, createTrainer };
