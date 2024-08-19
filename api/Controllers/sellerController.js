import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";
import Seller from "../Models/sellerModel.js";
import catchAsync from "../Utilities/catchAsync.js";
import User from "../Models/userShema.js";
import AppError from "../Utilities/appError.js";
import Product from "../Models/productSchema.js";

const addProduct = catchAsync(async (req, res, next) => {
  const { product } = req.body;

  if (!product) next(new AppError("Seller Must provide a Product", 400));

  const newProduct = await Product.create(product);

  if (!newProduct) return next(new AppError("Enter a Valid Product", 400));

  // Find the seller by ID and push the product into the products array
  const seller = await Seller.findByIdAndUpdate(
    req.seller._id,
    { $push: { products: newProduct._id } },
    { new: true, runValidators: true }
  );

  // Check if seller exists
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  res.status(200).json({
    status: "Success",
    message: "Succesfully added the product",
    seller,
  });
});

const removeProduct = catchAsync(async (req, res, next) => {
  const seller = req.seller;
  const productId = req.params.id;

  if (!productId) return next(new AppError("Please Give the product ID", 400));

  //Checking the current product is sellers or not
  const isSellersProduct = seller.products.some(
    (product) => product._id.toString() === productId
  );

  if (!isSellersProduct)
    return next(new AppError("This is not the current sellers product", 403));

  const curSeller = await Seller.findById(seller._id);
  if (!curSeller)
    return next(new AppError("Current User is not a seller", 401));

  const product = await Product.findByIdAndDelete(productId);

  if (!product)
    return next(new AppError("Please give a valid product ID", 400));

  res.status(200).json({
    status: "Success",
    message: "Successfully deleted the product",
    product,
  });
});

const deleteSeller = catchAsync(async (req, res, next) => {
  // Find the seller by ID
  const seller = await Seller.findById(req.params.id);

  // Check if the seller exists
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  // Delete the associated user
  await User.findByIdAndDelete(seller.user);

  // Delete the seller
  await Seller.findByIdAndDelete(req.params.id);

  // Send a response back to the client
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getAllSellers = getAll(Seller);
const getSeller = getOne(Seller);
const updateSeller = updateOne(Seller);

export default {
  getAllSellers,
  getSeller,
  updateSeller,
  deleteSeller,
  addProduct,
  removeProduct,
};
