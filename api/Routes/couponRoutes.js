import express from "express";
import couponController from "../Controllers/couponController.js";
import authController from "../Controllers/authController.js";

const router = express.Router();

router.use(authController.protect, authController.authorize("admin"));

router
  .route("/")
  .get(couponController.getAllCoupon)
  .post(couponController.createCoupon);
router
  .route("/:id")
  .get(couponController.getCoupon)
  .patch(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

export default router;
