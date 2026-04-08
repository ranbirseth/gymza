const DietPlan = require("../models/diet.model");
const Member = require("../models/member.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { AppError } = require("../utils/appError");

// Templates CRUD
const createDietTemplate = asyncHandler(async (req, res) => {
  const diet = await DietPlan.create({
    ...req.body,
    gymId: req.gymId,
    createdBy: req.user._id,
    isTemplate: true
  });
  sendResponse(res, { status: 201, message: "Diet template created", data: diet });
});

const getDietTemplates = asyncHandler(async (req, res) => {
  const templates = await DietPlan.find({ gymId: req.gymId, isTemplate: true });
  sendResponse(res, { message: "Templates fetched", data: templates });
});

const deleteDietPlan = asyncHandler(async (req, res) => {
  await DietPlan.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });
  sendResponse(res, { message: "Diet plan deleted" });
});

// Assignment
const assignDietToMember = asyncHandler(async (req, res) => {
  const { memberId, templateId, customPlan } = req.body;
  const member = await Member.findOne({ _id: memberId, gymId: req.gymId });
  if (!member) throw new AppError("Member not found", 404);

  let dietPlan;
  if (templateId) {
    const template = await DietPlan.findOne({ _id: templateId, gymId: req.gymId });
    if (!template) throw new AppError("Template not found", 404);
    
    // Create a copy for the member
    dietPlan = await DietPlan.create({
      ...template.toObject(),
      _id: undefined,
      isTemplate: false,
      assignedTo: memberId,
      createdBy: req.user._id,
      createdAt: undefined,
      updatedAt: undefined
    });
  } else if (customPlan) {
    dietPlan = await DietPlan.create({
      ...customPlan,
      gymId: req.gymId,
      isTemplate: false,
      assignedTo: memberId,
      createdBy: req.user._id
    });
  }

  member.assignedDiet = dietPlan._id;
  await member.save();

  sendResponse(res, { message: "Diet assigned successfully", data: dietPlan });
});

const getMemberDiet = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id }).populate("assignedDiet");
  if (!member) throw new AppError("Member profile not found", 404);
  sendResponse(res, { message: "Diet fetched", data: member.assignedDiet });
});

module.exports = {
  createDietTemplate,
  getDietTemplates,
  deleteDietPlan,
  assignDietToMember,
  getMemberDiet
};
