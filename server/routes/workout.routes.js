const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  createWorkoutTemplate,
  getWorkoutTemplates,
  deleteWorkoutPlan,
  assignWorkoutToMember,
  getMemberWorkout
} = require("../controllers/workout.controller");

router.use(protect);

// Member routes
router.get("/my-workout", authorize("member"), getMemberWorkout);

// Admin/Trainer routes
router.get("/templates", authorize("admin", "trainer"), getWorkoutTemplates);
router.post("/templates", authorize("admin"), createWorkoutTemplate);
router.delete("/:id", authorize("admin"), deleteWorkoutPlan);
router.post("/assign", authorize("trainer", "admin"), assignWorkoutToMember);

module.exports = router;
