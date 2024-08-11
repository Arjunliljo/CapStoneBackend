import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    totalPrice: {
      type: Number,
    },
    coupons: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Coupons",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.methods.calcTotalPrice = function (products) {
  return products.reduce((acc, prod) => prod.price + acc, 0);
};

cartSchema.pre(/^find/, function (next) {
  this.populate({ path: "products", select: "-__v -createdAt" });
  next();
});

cartSchema.pre("find", function (next) {
  this.populate({ path: "user", select: "name email phone" });
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
