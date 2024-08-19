import express from "express";
import authController from "../Controllers/authController.js";
import cartController from "../Controllers/cartController.js";

const router = express.Router();

router.use(authController.protect);

router.get("/get-my-cart", cartController.getMyCart);
router.patch(
  "/add-product-to-cart/:productId",
  cartController.addProductToMyCart
);
router.patch(
  "/remove-product-in-cart/:productId",
  cartController.removeProductInCart
);

router.use(authController.authorize("admin"));

router.route("/").get(cartController.getAllCart);
router.route("/:id").get(cartController.getCart);

router.get("/get-cart-by-mail/:email", cartController.getCartByEmail);

export default router;
