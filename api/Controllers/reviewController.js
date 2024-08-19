import Product from "../Models/productSchema.js";
import Review from "../Models/reviewModel.js";
import AppError from "../Utilities/appError.js";
import catchAsync from "../Utilities/catchAsync.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";

const getReviewsOfProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) return next(new AppError("Please provide a product ID", 400));

  const reveiws = await Review.find({ product: productId });

  if (!reveiws)
    return next(new AppError(`No product on this ${productId}`, 404));

  res.status(200).json({
    status: "Success",
    message: "Successfully fetched reveiws of the product",
    data: { reveiws },
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId)
    return next(new AppError("User must logged in post review", 401));

  const { productId, message } = req.body;

  if (!productId || !message)
    return next(
      new AppError("Please provide nessessary data before requesting", 400)
    );

  const product = await Product.findById(productId);

  if (!product) return next(new AppError("Invalid product", 400));

  const newReveiw = new Review({
    user: userId,
    product: productId,
    message,
  });

  await newReveiw.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "Success",
    message: "Succesfully created Reveiw",
    data: { newReveiw },
  });
});

const getAllReview = getAll(Review);
const getReview = getOne(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);

export default {
  getReviewsOfProduct,
  getAllReview,
  getReview,
  updateReview,
  deleteReview,
  createReview,
};
