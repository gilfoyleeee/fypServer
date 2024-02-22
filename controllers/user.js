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
