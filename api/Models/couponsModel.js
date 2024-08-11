import mongoose from "mongoose";

const couponSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Coupon Must have a name"],
    maxLength: [30, "Maximum 30 character..."],
    minLength: [3, "Maximum 3 characters..."],
  },
  discountPercent: {
    type: Number,
    required: true,
    min: [1, "Min off percentage is 1%"],
    max: [80, "Max off percentage is 80%"],
  },
  permanant: {
    type: Boolean,
    default: false,
  },
  expireDate: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    },
  },
});

couponSchema.pre("save", function (next) {
  if (this.permanent) {
    this.expireDate = undefined;
  }
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
