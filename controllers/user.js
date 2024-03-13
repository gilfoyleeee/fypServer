const FriendRequest = require("../models/frnRequest");
const User = require("../models/user");
const filterObject = require("../utils/filterObject");
const catchAsync = require("../utils/catchAsync");

//to update profile from user req and modifiy the db
exports.updateProfile = catchAsync(async (req, res, next) => {
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
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id");

  const this_user = req.user;

  //filtering user
  const rem_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "successfull",
    data: rem_users,
    message: "Users found successfully !",
  });
});

exports.getFrnRequests = catchAsync(async (req, res, next) => {
  const frnRequests = await FriendRequest.find({
    reciever: req.user._id,
  }).populate("sender")
  .select("_id firstName lastName");

  res.status(200).json({
    status: "success",
    data: frnRequests,
    message: "Friend requests found successfully !",
  });
});

exports.getFriends = catchAsync(async (req, res, next) => {
  // console.log("called")
  // console.log(req.user._id)
  const this_user = await User.findById(req.user._id).populate(
    "friends",
    "_id firstName lastName"
  );

  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "Friends found successfully !",
  });
});
