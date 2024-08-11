import Cart from "../Models/cartModel.js";
import Product from "../Models/productSchema.js";
import AppError from "../Utilities/appError.js";
import catchAsync from "../Utilities/catchAsync.js";
import { getAll, getOne, updateOne } from "./handlerFactory.js";

const getMyCart = catchAsync(async (req, res, next) => {
  const myCart = await Cart.findById(req.user.cart);
  if (!myCart)
    return next(
      new AppError("Your are not logged in how did you get this far..?"),
      401
    );

  res.status(200).json({
    status: "Success",
    message: `Successully fetched ${req.user.name}'s cart`,
    myCart,
  });
});

const addProductToMyCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) return next("Please provide the product Id", 400);

  const updatedCart = await Cart.findByIdAndUpdate(
    req.user.cart,
    {
      $addToSet: { products: productId },
    },
    { new: true, runValidators: true }
  );

  if (!updatedCart) return next(new AppError("Cart Not Found", 404));

  const totalPrice = updatedCart.calcTotalPrice(updatedCart.products);
  updatedCart.totalPrice = totalPrice;

  await updatedCart.save();

  res.status(201).json({
    status: "Success",
    message: "Added the product to the cart",
    cart: updatedCart,
  });
});

const removeProductInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new AppError("Please provide the product ID", 400));
  }

  const updatedCart = await Cart.findByIdAndUpdate(
    req.user.cart,
    { $pull: { products: productId } },
    { new: true }
  );

  if (!updatedCart) {
    return next(new AppError("Cart not found", 404));
  }

  const totalPrice = updatedCart.calcTotalPrice(updatedCart.products);
  updatedCart.totalPrice = totalPrice;

  await updatedCart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart: updatedCart,
    },
  });
});

const getAllCart = getAll(Cart);
const getCart = getOne(Cart);
const getCartByEmail = getOne(Cart, "email");

export default {
  getAllCart,
  getCart,
  getMyCart,
  addProductToMyCart,
  removeProductInCart,
  getCartByEmail,
};
