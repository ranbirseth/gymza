const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { markAttendance, checkIn, checkOut, history, faceVerifyPlaceholder } = require("../controllers/attendance.controller");

router.post("/mark", markAttendance);

router.use(protect);
router.get("/", authorize("admin", "trainer"), history);
router.post("/face-verify", authorize("admin", "trainer"), faceVerifyPlaceholder);
router.post("/check-in", authorize("admin", "trainer"), checkIn);
router.patch("/check-out/:id", authorize("admin", "trainer"), checkOut);

module.exports = router;
