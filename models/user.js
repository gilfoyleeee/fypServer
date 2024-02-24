//this gonna contains all the business logic of authentication

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required !"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required !"],
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required !"],
    //js regular expression for email validation, taken from stackoverflow
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Invalid Email Address (${props.value}) !`,
    },
  },
  password: {
    type: String,
  },
  confirmPw: {
    type: String,
  },
  pwChangedTime: {
    type: Date,
  },
  pwResetToken: {
    type: String,
  },
  pwResetExpireDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  OTP_expiryTime: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  //only run this function if OTP is actually modified
  if (!this.isModified("otp") || !this.otp) return next();

  //hashing otp with cost of 12
  this.otp = await bcrypt.hash(this.otp.toString(), 12);

  console.log(this.otp.toString(), "FROM PRE SAVE HOOK");

  next();
});

userSchema.pre("save", async function (next) {
  //only run this function if password is actually modified
  if (!this.isModified("password") || !this.password) return next();

  //hashing password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//checking pw
//candidatepw = inputted from user in UI
//userPw = hashed pw that is actually saved in DB
userSchema.methods.checkPw = async function (candidatePw, userPw) {
  return await bcrypt.compare(candidatePw, userPw);
};

//checking OTP
//candidateOTP = inputted from user in UI
//userOTP = hashed OTP that is actually saved in DB
userSchema.methods.checkOTP = async function (candidateOTP, userOTP) {
  return await bcrypt.compare(candidateOTP, userOTP);
};

userSchema.methods.createPwResetToken = function () {
  //creating reset token with 32 bytes string and converting into hexadecimal
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.pwResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.pwResetExpireDate = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.changePwAfterToken = function (timestamp) {
  return timestamp < this.pwChangedTime;
};

const User = new mongoose.model("User", userSchema);
module.exports = User;
