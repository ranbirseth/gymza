const Plan = require("../models/plan.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const createPlan = asyncHandler(async (req, res) => {
  req.body.gymId = req.gymId;
  const plan = await Plan.create(req.body);
  sendResponse(res, { status: 201, message: "Plan created", data: plan });
});
const listPlans = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const query = { gymId: req.gymId };
  if (req.query.search) query.name = new RegExp(req.query.search, "i");
  const [items, total] = await Promise.all([
    Plan.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Plan.countDocuments(query)
  ]);
  sendResponse(res, { message: "Plans fetched", data: { items, total, page, limit } });
});
const updatePlan = asyncHandler(async (req, res) => sendResponse(res, { message: "Plan updated", data: await Plan.findOneAndUpdate({ _id: req.params.id, gymId: req.gymId }, req.body, { new: true }) }));
const deletePlan = asyncHandler(async (req, res) => {
  await Plan.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });
  sendResponse(res, { message: "Plan deleted", data: {} });
});

module.exports = { createPlan, listPlans, updatePlan, deletePlan };
