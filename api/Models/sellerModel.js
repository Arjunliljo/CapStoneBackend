import mongoose from "mongoose";

const sellerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Seller Must be a User"],
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, "Seller Must have a shop name"],
      maxlength: [20, "product name should be less than 20 characters"],
      minlength: [3, "product name should be greater than 3 characters"],
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

sellerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v -password",
  });
  next();
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
