const dayjs = require("dayjs");
const mongoose = require("mongoose");

const product_images_schema = new mongoose.Schema({
  image_id: {
    type: String,
    default: () => {
      return `IMG_${new mongoose.Types.ObjectId().toString()}`;
    },
  },
  product_id: {
    type: String,
  },
  src: {
    data: Buffer,
    contentType: String,
  },
  created_time: {
    type: Date,
    default: dayjs(),
  },
  alt: {
    type: String,
    default: () => {
      return "image";
    },
  },
});

const product_schema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      default: () => {
        return `PROD_${new mongoose.Types.ObjectId().toString()}`;
      },
    },
    name: {
      type: String,
      required: [true, "Product name should not be empty"],
    },
    tags: {
      type: Array,
      required: [true, "Product tags should not be empty"],
    },
    type: {
      type: String,
      required: [true, "Product type should not be empty"],
      enum: ["shirts", "t-shirts", "pants"],
    },
    size: {
      type: Object,
    },
    price: {
      type: Number,
      required: [true, "Product type should not be empty"],
    },
    description: {
      type: String,
    },
    total: {
      type: Number,
      required: [true, "Product total should not be empty"],
    },
    images: [product_images_schema],
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", product_schema);

module.exports = Product;
