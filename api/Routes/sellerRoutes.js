import express from "express";
import sellerController from "../Controllers/sellerController.js";
import authController from "../Controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.sellerSignUp);
router.post("/login", authController.login);

router.use(authController.protect);

router.post(
  "/add-product",
  authController.checkSeller,
  sellerController.addProduct
);
router.patch(
  "/remove-product/:id",
  authController.checkSeller,
  sellerController.removeProduct
);


router.route("/").get(authController.authorize('admin'), sellerController.getAllSellers);

router.use(authController.authorize("admin", "seller"));
router
  .route("/:id")
  .get(sellerController.getSeller)
  .patch(sellerController.updateSeller)
  .delete(sellerController.deleteSeller);

export default router;
