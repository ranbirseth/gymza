const Payment = require("../models/payment.model");
const Notification = require("../models/notification.model");
const Member = require("../models/member.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const createPayment = asyncHandler(async (req, res) => {
  const invoiceNumber = `INV-${Date.now()}`;
  const gymId = req.gymId;
  const payment = await Payment.create({
    ...req.body,
    gymId,
    invoiceNumber,
    invoice: {
      invoiceNumber,
      amount: req.body.amount,
      member: req.body.member,
      createdAt: new Date().toISOString()
    }
  });
  const member = await Member.findOne({ _id: req.body.member, gymId });
  if (member) {
    await Notification.create({
      user: member.user,
      title: req.body.status === "pending" ? "Payment pending" : "Payment received",
      message: `Invoice ${invoiceNumber} (${req.body.status || "paid"})`,
      type: "payment"
    });
  }
  sendResponse(res, { status: 201, message: "Payment recorded", data: payment });
});

const listPayments = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const filter = {
    gymId: req.gymId,
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.method ? { method: req.query.method } : {})
  };
  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("member"),
    Payment.countDocuments(filter)
  ]);
  sendResponse(res, { message: "Payments fetched", data: { items, page, limit, total } });
});

const pendingDues = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const filter = { gymId: req.gymId, status: "pending" };
  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("member"),
    Payment.countDocuments(filter)
  ]);
  sendResponse(res, { message: "Pending dues fetched", data: { items, page, limit, total } });
});

const getInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!payment) throw Object.assign(new Error("Payment not found in your gym"), { statusCode: 404 });
  sendResponse(res, { message: "Invoice fetched", data: payment.invoice });
});

const createOnlinePaymentIntent = asyncHandler(async (req, res) => {
  const mockIntentId = `MOCK_INTENT_${Date.now()}`;
  sendResponse(res, {
    status: 201,
    message: "Mock online payment intent created",
    data: { intentId: mockIntentId, status: "created", gateway: "mock" }
  });
});

const confirmOnlinePayment = asyncHandler(async (req, res) => {
  const { intentId, member, amount } = req.body;
  if (!intentId || !member || !amount) throw Object.assign(new Error("intentId, member and amount are required"), { statusCode: 400 });
  req.body.method = "online";
  req.body.status = "paid";
  const invoiceNumber = `INV-${Date.now()}`;
  const payment = await Payment.create({
    gymId: req.gymId,
    member,
    amount,
    method: "online",
    status: "paid",
    invoiceNumber,
    invoice: { invoiceNumber, intentId, amount, member, createdAt: new Date().toISOString(), gateway: "mock" }
  });
  sendResponse(res, { message: "Mock online payment confirmed", data: payment });
});

module.exports = { createPayment, listPayments, pendingDues, getInvoice, createOnlinePaymentIntent, confirmOnlinePayment };
