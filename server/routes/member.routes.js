const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const upload = require("../utils/upload");
const {
  createMember,
  listMembers,
  searchMembers,
  getMember,
  updateMember,
  deleteMember,
  assignPlan,
  renewPlan,
  upgradePlan,
  cancelPlan,
  freezePlan,
  resumePlan,
  approveMember,
  getMyProfile,
  updateMyProfile
} = require("../controllers/member.controller");

router.use(protect);
router.get("/", authorize("superadmin", "admin", "trainer"), listMembers);
router.get("/search", authorize("superadmin", "admin", "trainer"), searchMembers);
router.post("/", authorize("superadmin", "admin"), upload.single("photo"), createMember);
router.get("/profile/me", authorize("member"), getMyProfile);
router.patch("/profile/me", authorize("member"), upload.single("photo"), updateMyProfile);
router.get("/:id", authorize("superadmin", "admin", "trainer", "member"), getMember);
router.put("/:id", authorize("superadmin", "admin", "trainer"), upload.single("photo"), updateMember);
router.delete("/:id", authorize("superadmin", "admin"), deleteMember);
router.patch("/:id/assign-plan", authorize("superadmin", "admin", "trainer"), assignPlan);
router.patch("/:id/renew-plan", authorize("superadmin", "admin", "trainer"), renewPlan);
router.patch("/:id/upgrade-plan", authorize("superadmin", "admin", "trainer"), upgradePlan);
router.patch("/:id/cancel-plan", authorize("superadmin", "admin", "trainer"), cancelPlan);
router.patch("/:id/freeze-plan", authorize("superadmin", "admin", "trainer"), freezePlan);
router.patch("/:id/resume-plan", authorize("superadmin", "admin", "trainer"), resumePlan);
router.patch("/:id/approve", authorize("superadmin", "admin", "trainer"), approveMember);

module.exports = router;
