const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  createDietTemplate,
  getDietTemplates,
  deleteDietPlan,
  assignDietToMember,
  getMemberDiet
} = require("../controllers/diet.controller");

router.use(protect);

// Member routes
router.get("/my-diet", authorize("member"), getMemberDiet);

// Admin/Trainer routes
router.get("/templates", authorize("admin", "trainer"), getDietTemplates);
router.post("/templates", authorize("admin"), createDietTemplate);
router.delete("/:id", authorize("admin"), deleteDietPlan);
router.post("/assign", authorize("trainer", "admin"), assignDietToMember);

module.exports = router;
