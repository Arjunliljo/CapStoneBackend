import express from "express";
import productController from "../Controllers/productController.js";
import authController from "../Controllers/authController.js";
import filterData from "../Utilities/filterData.js";

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.authorize("admin", "seller"),
    filterData("Product"),
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.authorize("admin", "seller"),
    filterData("Product"),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.authorize("admin", "seller"),
    productController.deleteProduct
  );

export default router;
