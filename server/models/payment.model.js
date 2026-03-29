const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    gymId: { type: String, required: true, index: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["cash", "card", "upi", "online"], default: "cash" },
    status: { type: String, enum: ["paid", "pending"], default: "paid", index: true },
    invoiceNumber: { type: String, required: true, index: true },
    invoice: { type: Object, default: {} },
    dueDate: Date
  },
  { timestamps: true }
);

paymentSchema.index({ gymId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
