const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  createPayment,
  listPayments,
  pendingDues,
  getInvoice,
  createOnlinePaymentIntent,
  confirmOnlinePayment
} = require("../controllers/payment.controller");

router.use(protect);
router.get("/", authorize("admin", "trainer"), listPayments);
router.get("/dues", authorize("admin", "trainer"), pendingDues);
router.get("/:id/invoice", authorize("admin", "trainer", "member"), getInvoice);
router.post("/", authorize("admin", "trainer"), createPayment);
router.post("/online/intent", authorize("admin", "trainer", "member"), createOnlinePaymentIntent);
router.post("/online/confirm", authorize("admin", "trainer", "member"), confirmOnlinePayment);

module.exports = router;
