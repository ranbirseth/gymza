const router = require("express").Router();
const { signup, login, refresh, logout } = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { signupSchema, loginSchema, refreshSchema } = require("../validations/auth.validation");

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);

module.exports = router;
