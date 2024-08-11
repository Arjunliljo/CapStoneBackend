import User from "../Models/userShema.js";
import Cart from "../Models/cartModel.js";
import AppError from "../Utilities/appError.js";
import catchAsync from "../Utilities/catchAsync.js";
import { deleteOne, getAll, getOne } from "./handlerFactory.js";

const getMe = catchAsync(async (req, res, next) => {
  //req.user coming from protect middleware
  const me = req.user;

  res.status(200).json({
    status: "Success",
    message: "Successfully fetched the user",
    envelop: {
      me,
    },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError("This is not the route for updating password..", 400)
    );

  //coming from protect middleware
  const userId = req.user._id;

  const updatedMe = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    message: `${updatedMe.name}'s data updated successfully`,
    envelop: {
      user: updatedMe,
    },
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // body filters will run there is a filterData middle ware running before this to filter the body
  const { password, newPassword, confirmNewPassword } = req.body;

  // 1). Check whole nesseccery informations are provided
  if (!newPassword || !password || !confirmNewPassword)
    return next(new AppError(`User must provide valid details..`, 400));

  // 2). Check the given current password matching the old password

  // req.user is coming from protect middleware
  const user = req.user;

  const isPassword = await user.checkPassword(password, user.password);
  if (!isPassword)
    return next(new AppError("Your current password is invalid", 400));

  // 3). check the newPassword and confrimNewPassword are equal or not

  // this will check the password and confirm password matching with mongoose validator
  // also it will trigger the document middle ware in userShema so password will be hashed also
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;

  // 4). reset password
  await user.save();

  res.status(201).json({
    status: "Success",
    message: "Password changed successfully",
    envelop: {
      user,
    },
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide the email.."));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError("No user founded on provided email.."));

  await user.createPasswordResetOtp(email);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Success",
    message: "otp Sended to valid for only 10 minutes " + email,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {});

const getAllUsers = getAll(User);
const getUser = getOne(User);
const deleteUser = deleteOne(User);

const deleteAllUsers = async (req, res, next) => {
  await User.deleteMany({});
  await Cart.deleteMany({});
  res.status(200).json({ status: "Success", message: "Deleted All Users" });
};

export default {
  getAllUsers,
  getUser,
  deleteUser,
  deleteAllUsers,
  getMe,
  deleteMe,
  updateMe,
  resetPassword,
  forgotPassword,
};
