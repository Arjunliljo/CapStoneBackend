import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Review must belong to a User"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "A Review must belong to a Product"],
  },
  message: {
    type: String,
    required: [true, "A Review must have a message"],
  },
});

// Ensure that a user can only create one review per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" }).populate({
    path: "product",
    select: "price name category",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
