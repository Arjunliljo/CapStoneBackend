import express from "express";
import productController from "../Controllers/productController.js";
import authController from "../Controllers/authController.js";
import filterData from "../Utilities/filterData.js";

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(filterData("Product"), productController.createProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(filterData("Product"), productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
