const router = require("express").Router(); //creating express router
const authController = require("../controllers/auth");
router.post("/login", authController.login);
router.post("/regsister", authController.register);
router.post("/send_otp", authController.sendOTP);
router.post("/verify_otp", authController.verifyOTP);
router.post("/forgot_pw", authController.forgotUserPw);
router.post("/reset_pw", authController.resetUserPw);

module.exports = router;
