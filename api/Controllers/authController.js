import jwt from "jsonwebtoken";
import User from "../Models/userShema.js";
import catchAsync from "../Utilities/catchAsync.js";
import AppError from "../Utilities/appError.js";
import { otpToPhone } from "../Utilities/otpGenerate.js";
import Cart from "../Models/cartModel.js";
import Seller from "../Models/sellerModel.js";

const KEY = process.env.JWT_SECRET;

const generateToken = (id) => {
  return jwt.sign({ id }, KEY);
};

const sendToken = (newUser, statusCode, res, userId) => {
  const id = userId ? userId : newUser._id;

  console.log(id === userId);

  const token = generateToken(id);
  if (!token) return next(new AppError("Server failed to create token", 500));

  res.cookie("token", token, { httpOnly: true });

  res.status(statusCode).json({
    status: "Success",
    message: "Successfully logged in",
    envelop: {
      newUser,
    },
  });
};

const sellerSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, phone, shopName } = req.body;

  // Create the seller first
  const newUser = new User({
    name,
    email,
    password,
    phone,
    confirmPassword,
    role: "seller",
  });

  const newSeller = new Seller({
    shopName,
  });

  newSeller.user = newUser._id;

  await newUser.save();
  await newSeller.save();

  // Send the token
  sendToken(newSeller, 201, res, newUser._id);
});

const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, phone } = req.body;

  // Create the user first
  const newUser = await User.create({
    name,
    email,
    password,
    phone,
    confirmPassword,
  });

  // Create the cart concurrently
  const newUserCart = await Cart.create({
    user: newUser._id,
    products: [],
  });

  // Link the cart to the user in a single save call
  newUser.cart = newUserCart._id;
  await newUser.save({ validateBeforeSave: false });

  // Send the token
  sendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("User must give email and password to login"));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User did not exist..", 404));

  //checking password is matching or not
  const isPasswordCorrect = await user.checkPassword(password, user.password);
  if (!isPasswordCorrect) return next(new AppError("Incorrect Password.."));

  // restricting password going to frontend
  user.password = undefined;

  if (user.role === "seller") {
    const seller = await Seller.findOne({ user: user._id });
    if (!seller) return next(new AppError("Current User is not a Seller", 400));

    return sendToken(seller, 200, res, user._id);
  }

  sendToken(user, 200, res);
});

const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("token");
  res
    .status(200)
    .json({ status: "Success", message: "Logged out, cookie cleared" });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check its there
  const token = req.cookies.token;
  if (!token) return next(new AppError("Please Login to get access..", 401));

  // 2) Varify token
  const decode = jwt.verify(token, KEY); // there is a chance to get error

  // 3) Check the user is still exist to make sure
  const currentUser = await User.findById(decode.id);
  if (!currentUser)
    return next(new AppError("The User belong to this token is not exist"));

  // 4) Check the password is changed after the token is issued
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(
        "The User recently changed password, Please login again",
        401
      )
    );
  }

  // passing the user  to next middleware
  req.user = currentUser;

  next();
});

const checkSeller = catchAsync(async (req, res, next) => {
  // Ensure protect middleware is used first to set req.user
  const user = req.user;

  // Check if the current user is a seller
  const seller = await Seller.findOne({ user: user._id });
  if (!seller) return next(new AppError("Current User is not a seller", 400));

  // Passing the seller to the next middleware
  req.seller = seller;
  next();
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.params;
  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("Something went wrong user not found...", 400));

  if (Date.now() > user.otpExpires) {
    return next(new AppError("This Otp is expired. Try again..", 401));
  }

  if (user.passwordResetOtp !== otp)
    return next(new AppError("Incorrect OTP check your inbox again...", 400));

  sendToken(user, 200, res);
});

const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      // If not, pass an error to the next middleware
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    // If the user is authorized, proceed to the next middleware
    next();
  };
};

export default {
  signUp,
  protect,
  logout,
  login,
  verifyOtp,
  sellerSignUp,
  checkSeller,
  authorize,
};
