require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const { connectDb } = require("./config/db");
const { connectRedis } = require("./config/redis");
const { configureCloudinary } = require("./config/cloudinary");
const { errorHandler } = require("./middlewares/error.middleware");
const { startExpiryReminderJob } = require("./jobs/expiryReminder.job");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || "*", credentials: true } });
app.locals.io = io;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Server healthy", data: {} }));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/members", require("./routes/member.routes"));
app.use("/api/plans", require("./routes/plan.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/progress", require("./routes/progress.routes"));
app.use("/api/entities", require("./routes/generic.routes"));
app.use("/api/trainers", require("./routes/trainer.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/referrals", require("./routes/referral.routes"));

io.on("connection", (socket) => {
  const gymId = socket.handshake.query.gymId;
  if (gymId) {
    socket.join(gymId);
    socket.emit("connected", { message: `Joined realtime for gym: ${gymId}` });
  } else {
    socket.emit("connected", { message: "Realtime connected. Join a gym room." });
  }

  socket.on("joinGym", (id) => {
    socket.join(id);
  });
});

app.use(errorHandler);

const start = async () => {
  await connectDb();
  connectRedis();
  configureCloudinary();
  startExpiryReminderJob();
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`Server running on :${port}`));
};

start();
