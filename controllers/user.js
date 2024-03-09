const FriendRequest = require("../models/frnRequest");
const User = require("../models/user");
const filterObject = require("../utils/filterObject");

//to update profile from user req and modifiy the db
exports.updateProfile = async (req, res, next) => {
  const { user } = req;
  const filteredBody = filterObject(
    req.body,
    "firstName",
    "lastName",
    "bio",
    "avatar"
  );
  const updated_user_profile = await User.findByIdAndUpdate(
    user._id,
    filteredBody,
    {
      new: true,
      validateModifiedOnnly: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updated_user_profile,
    message: "User Profile updated successfully !",
  });
};

exports.getUsersFromDB = async (req, res, next) => {
  const all_users_fromDB = await User.find({
    verified: true,
  }).select("firstName lastName _id");

  const to_check_user = req.user;

  //filtering user
  const rem_users = all_users_fromDB.filter(
    (user) =>
      !to_check_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "successfull",
    data: rem_users,
    message: "Users found successfully !",
  });
};

exports.getFrnRequests = async (req, res, next) => {
  const frnRequests = await FriendRequest.find({
    reciever: req.user._id,
  }).populate("sender", "_id firstName lastName");

  res.status(200).json({
    status: "success",
    data: frnRequests,
    message: "Friend requests found successfully !",
  });
};

exports.getFriends = async (req, res, next) => {
  const this_user = await User.findById(req.user._id).populate(
    "friends",
    "_id firstName lastName"
  );

  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "Friends found successfully !",
  });
};
