//jwt contain header, payload and verify signature
const jwt = require("jsonwebtoken");

const crypto = require("crypto");

//otp generator from npm packages
const otpGenerator = require("otp-generator");

const emailService = require("../services/mail");

const User = require("../models/user");
const filterObject = require("../utils/filterObject");
const { promisify } = require("util");

const signToken = (userID) => jwt.sign({ userID }, process.env.JWT_SECRET_KEY);
//signup process => register - sendOTP - verifyOTP

//new user registration
exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObject(
    req.body,
    "firstName",
    "lastName",
    "password",
    "email"
  );

  //checking if the user with given email is existed already
  const user_existing_status = await User.findOne({ email: email });

  //if email is already linked and verified with otp
  if (!user_existing_status && user_existing_status.verified) {
    res.status(400).json({
      status: "error",
      message:
        "An account is already linked to this email address, Please login !",
    });
  } //if email is linked but not verified with otp
  else if (user_existing_status) {
    const updated_user = await User.findOneAndUpdate(
      { email: email },
      filteredBody,
      {
        new: true,
        validateModifiedOnly: true,
      }
    );
    req.userID = user_existing_status._id;
    next();
  } else {
    //if user isnot in our DB i.e. email is not used for single time
    const new_user = await User.create(filteredBody);

    //sending otp through email to the user
    req.userID = new_user._id;
    next();
  }
};
//otp sending function
exports.sendOTP = async (req, res, next) => {
  const { userID } = req;
  const new_OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //modifying otp expiry time
  const OTP_expiryTime = Date.now() + 10 * 60 * 1000; //10 mins

  await User.findByIdAndUpdate(userID, {
    otp: new_OTP,
    OTP_expiryTime,
  });

  //send email with otp
  emailService.sendMail({
    from: "",
    to: "",
    subject: "Your OTP Verification Code for ChitChat",
    text: `Thank you for choosing our service. To complete your account registration/verification, please use the following One-Time Password (OTP):

    OTP: ${new_OTP}
    
    Please enter this OTP code within 10 mins to verify your email address and access your account.
    
    If you did not request this OTP, please disregard this email.`,
  });

  res.status(200).json({
    status: "success",
    message: "OTP Sent Successfully !",
  });
};

exports.verifyOTP = async (req, res, next) => {
  //this is to verify otp and save the user data in the database
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    OTP_expiryTime: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Invalid email or OTP expired !",
    });
  }
  //if incorrect otp
  if (!(await user.checkOTP(otp, user.otp))) {
    res.status(400).json({
      status: "error",
      message: "Incorrect OTP !",
    });
  }
  //if correct otp
  user.verified = true;
  user.otp = undefined;

  await user.save({ new: true, validateModifiedOnly: true });
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

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    message: "Successfully Logged in !",
    token,
  });
};

exports.protect = async (req, res, next) => {
  // 1st step => get jwt token and check
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    req.status(400).json({
      status: "error",
      message: "Please log in first to access this page !",
    });
  }
  //2nd step => verify token
  const decodedJWT = await promisif(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  //3rd step => check user existence
  const to_check_user = await User.findById(decodedJWT.userID);

  if (!to_check_user) {
    res.status(400).json({
      status: "error",
      message: "User doesn't exist !",
    });
  }
  //4th step => check if user change password after token issued
  //iat => the time when token was created
  if (to_check_user.changePwAfterToken(decodedJWT.iat)) {
    res.status(400).json({
      status: "error",
      message: "Password expired, Please login again !",
    });
  }
  req.user = to_check_user;
  next();
};

//Types of route - 1) Protected route (only logged in user can access ) 2) Unprotected route (just -ve)

//when user forgot password and tries to reset password
exports.forgotUserPw = async (req, res, next) => {
  //1st step => get user email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "No user found linked with this email address !",
    });

    return;
  }
  // 2nd step => to generate random code as reset token
  const resetToken = user.createPwResetToken();

  const pwresetURL = `https://chitchat.com/auth/resetpassword?code=${resetToken}`;

  try {
    //send email with reset url
    res.status(200).json({
      status: "success",
      message: "Email for password reset sent successfully !",
    });
  } catch (error) {
    user.pwResetToken = undefined;
    user.pwResetExpireDate = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      status: "error",
      message:
        "Server error occured while sending email, Please try again later !",
    });
  }
};

exports.resetUserPw = async (req, res, next) => {
  //1st step => get user based on token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    pwResetToken: hashedToken,
    pwResetExpireDate: { $gt: Date.now() },
  });

  //if token has expired
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Invalid token !",
    });
    return;
  }
  //3rd step => updating user password and setting resetToken and expiredate to undefined
  user.password = req.body.password;
  user.confirmPw = req.body.confirmPw;
  user.pwResetToken = undefined;
  user.pwResetExpireDate = undefined;

  await user.save();

  //4th step => after everything done, login to user and send jwt

  //todo => send email to user informing about password reset

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    message: "Password resetted successfully!",
    token,
  });
};
