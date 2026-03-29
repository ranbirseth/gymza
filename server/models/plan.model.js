const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    gymId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    durationType: { type: String, enum: ["monthly", "yearly"], required: true },
    price: { type: Number, required: true, min: 0 },
    features: [{ type: String }]
  },
  { timestamps: true }
);

planSchema.index({ gymId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Plan", planSchema);
