const router = require("express").Router(); //creating express router

const userController = require("../controllers/user");
const authController = require("../controllers/auth");

//deploying protect middleware before updateprofile so that only logged in user can access it
router.patch(
  "/update_profile",
  authController.protect,
  userController.updateProfile
);

router.get("/get_friends", authController.protect, userController.getFriends);

router.get(
  "/get_friendrequests",
  authController.protect,
  userController.getFrnRequests
);

router.get("/get_users", authController.protect, userController.getUsersFromDB);
module.exports = router;
