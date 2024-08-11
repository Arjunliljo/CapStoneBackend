import mongoose from "mongoose";

const productsShema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
      maxlength: [20, "product name should be less than 20 characters"],
      minlength: [3, "product name should be greater than 3 characters"],
      unique: true,
    },

    description: {
      type: String,
      required: [true, "Product must have a description"],
      maxlength: [200, "Description must be lesthan 50 characters"],
      minlength: [10, "Description must be lesthan 50 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product Must have a Price"],
    },

    ratingQty: {
      type: Number,
      default: 0,
    },
    avgRatings: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 10,
    },
    category: {
      type: String,
      required: [true, "Product must have a category"],
    },
    image: String,
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productsShema);

export default Product;
