import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import AppError from "../Utilities/appError.js";
import { otpToEmail } from "../Utilities/otpGenerate.js";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Must have a Name"],
      maxlength: [20, "User name should be less than 20 characters"],
      minlength: [3, "User name should be greater than 3 characters"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "User must have an Email"],
      maxlength: [30, "Email should be less than 20 characters"],
      minlength: [3, "email should be greater than 3 characters"],
      Lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "User must have a Phone Number"],
      validate: {
        validator: function (value) {
          return value.length >= 10 && value.length <= 13;
        },
        message:
          "Enter a valid phone number with a length between 9 and 13 digits",
      },
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: [8, "Password must have atleast 8 characters"],
    },
    confirmPassword: {
      type: String,
      required: [true, "User must have a confirm password"],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Password did not matching",
      },
    },
    cart: {
      type: mongoose.Schema.ObjectId,
      ref: "Cart",
    },
    role: {
      type: String,
      enum: ["customer", "admin", "seller"],
      default: "customer",
    },

    active: {
      type: Boolean,
      select: false,
      default: true,
    },

    changePasswordDate: Date,
    passwordResetOtp: String,
    otpExpires: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// deselecting fields that don't want to give to frontend
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }).select("-__v");
  // this.populate({ path: "cart", select: "products" });

  next();
});

//Encrypting password and checking password and confirm password are correct
userSchema.pre("save", async function (next) {
  //check the password is modified or not for when we update
  if (!this.isModified("password")) return next();

  if (this.confirmPassword !== this.password)
    return next(
      new AppError("password and confirmPassword are not matching...", 401)
    );

  const saltRounds = 10;

  this.password = await bcrypt.hash(this.password, saltRounds);
  this.confirmPassword = undefined;

  this.changePasswordDate = Date.now();

  next();
});

//checking password for login
userSchema.methods.checkPassword = async function (
  loginPassword,
  hashedPassword
) {
  return await bcrypt.compare(loginPassword, hashedPassword);
};

//Protect middle ware using this
userSchema.methods.changedPasswordAfter = function (jwtTimeStamb) {
  if (this.changePasswordDate) {
    const changedTimeStamb = parseInt(this.changePasswordDate.getTime()) / 1000;
    return jwtTimeStamb < changedTimeStamb;
  }

  return false;
};

// password Reset
userSchema.methods.createPasswordResetOtp = async function (email) {
  const [response, status, otp] = await otpToEmail(email);

  if (status !== "OK" || !otp)
    return next(new AppError("Failed to generate otp please try again..", 500));

  this.passwordResetOtp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
};

const User = mongoose.model("User", userSchema);

export default User;
