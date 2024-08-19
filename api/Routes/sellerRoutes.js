import express from "express";
import sellerController from "../Controllers/sellerController.js";
import authController from "../Controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.sellerSignUp);
router.post("/login", authController.login);
router.post(
  "/add-product",
  authController.protect,
  authController.checkSeller,
  sellerController.addProduct
);

router.route("/").get(sellerController.getAllSellers);

router
  .route("/:id")
  .get(sellerController.getSeller)
  .patch(sellerController.updateSeller)
  .delete(sellerController.deleteSeller);

export default router;
