import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";
import Seller from "../Models/sellerModel.js";
import catchAsync from "../Utilities/catchAsync.js";
import User from "../Models/userShema.js";

const addProduct = catchAsync(async (req, res, next) => {
  const { product } = req.body;
  if (!product) next(new AppError("Seller Must provide a Product", 400));
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
};
