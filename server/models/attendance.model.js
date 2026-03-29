const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: String, required: true, index: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    checkIn: { type: Date, required: true, default: Date.now, index: true },
    checkOut: Date,
    faceRecognitionMatched: { type: Boolean, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
