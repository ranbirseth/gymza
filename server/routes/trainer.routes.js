const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { listTrainers, createTrainer } = require("../controllers/trainer.controller");

router.use(protect, authorize("admin"));
router.get("/", listTrainers);
router.post("/", createTrainer);

module.exports = router;
