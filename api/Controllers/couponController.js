import Coupon from "../Models/couponsModel.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";

const getAllCoupon = getAll(Coupon);
const getCoupon = getOne(Coupon);
const createCoupon = createOne(Coupon);
const updateCoupon = updateOne(Coupon);
const deleteCoupon = deleteOne(Coupon);

export default {
  createCoupon,
  getAllCoupon,
  getCoupon,
  deleteCoupon,
  updateCoupon,
};
