const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: String, required: true, index: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    checkIn: { type: Date, required: true, default: Date.now },
    checkOut: Date,
    status: { type: String, enum: ["present", "completed"], default: "present" },
    faceRecognitionMatched: { type: Boolean, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
