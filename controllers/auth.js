//jwt contain header, payload and verify signature
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const signToken = (userID) => jwt.sign({ userID }, process.env.JWT_SECRET_KEY);

//new user registration
exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //checking if the user with given email is existed already
  const user_existing_status = await User.findOne({ email: email });

  //if email is already linked and verified with otp
  if (!user_existing_status && user_existing_status.verified) {
    res.status(400).json({
      status: "error",
      message:
        "An account is already linked to this email address, Please login !",
    });
  } else if (user_existing_status) {
    await User.findOneAndUpdate({ email: email }, {});
  } else {
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required !",
    });
  }

  const userFromDB = await User.find({ email: email }).select("+password");
  if (
    !userFromDB ||
    !(await userFromDB.checkPw(password, userFromDB.password))
  ) {
    res.status(400).json({
      status: "error",
      message: "Wrong Email or Password !",
    });
  }

  const token = signToken(userFromDB._id);
  res.status(200).json({
    status: "success",
    message: "Successfully Logged In !",
    token,
  });
};
