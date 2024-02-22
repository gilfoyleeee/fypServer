const router = require("express").Router(); //creating express router

const userController = require("../controllers/user");
const authController = require("../controllers/auth");

//deploying protect middleware before updateprofile so that only logged in user can access it
router.patch(
  "/update_profile",
  authController.protect,
  userController.updateProfile
);

module.exports = router;
