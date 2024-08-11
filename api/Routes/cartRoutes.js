import express from "express";
import authController from "../Controllers/authController.js";
import cartController from "../Controllers/cartController.js";

const router = express.Router();

router.get("/get-my-cart", authController.protect, cartController.getMyCart);
router.patch(
  "/add-product-to-cart/:productId",
  authController.protect,
  cartController.addProductToMyCart
);
router.patch(
  "/remove-product-in-cart/:productId",
  authController.protect,
  cartController.removeProductInCart
);

router.route("/").get(cartController.getAllCart);
router.route("/:id").get(cartController.getCart);

router.get("/get-cart-by-mail/:email", cartController.getCartByEmail);

export default router;
