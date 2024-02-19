//this gonna contains all the business logic of authentication

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required !"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required !"],
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
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

userSchema.methods.checkPw = async function(
    candidatePassword,
    userPassword,
){
    return await bcrypt.compare(candidatePassword, userPassword);
}

const User = new mongoose.model("User", userSchema);
module.exports = User;
