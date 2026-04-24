import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  subSubCategory: {
    type: String,
    default: '',
  },
  sizes: {
    type: Array,
    required: true,
  },
  bestSeller: {
    type: Boolean,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  vendorId: {
    type: String,
    default: null,
  },
  date: {
    type: Number,
    required: true,
  },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
