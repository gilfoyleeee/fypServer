const router = require("express").Router(); //creating express router
const authController = require("../controllers/auth");
router.post("/login", authController.login);
router.post("/register", authController.register, authController.sendOTP);
router.post("/verify_otp", authController.verifyOTP);
router.post("/send_otp", authController.sendOTP);
router.post("/forgot_pw", authController.forgotUserPw);
router.post("/reset_pw", authController.resetUserPw);

module.exports = router;
