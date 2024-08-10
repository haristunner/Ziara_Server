const mongoose = require("mongoose");

const address_schema = new mongoose.Schema({
  address_id: {
    type: String,
    default: () => {
      return `ADD_${new mongoose.Types.ObjectId().toString()}`;
    },
    trim: true,
    unique: true,
  },
  customer_id: { type: String },
  street: { type: String },
  city: { type: String },
  district: { type: String },
  state: { type: String },
  postal_code: {
    type: String,
  },
});

const cart_schema = new mongoose.Schema({
  cart_id: {
    type: String,
    default: () => {
      return `CART_${new mongoose.Types.ObjectId().toString()}`;
    },
    trim: true,
    unique: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  size: {
    type: String,
    required: true,
  },
});

const wishlist_schema = new mongoose.Schema({
  cart_id: {
    type: String,
    default: () => {
      return `WSHT_${new mongoose.Types.ObjectId().toString()}`;
    },
    trim: true,
    unique: true,
  },
  product_id: {
    type: String,
    required: true,
  },
});

const user_schema = new mongoose.Schema({
  user_id: {
    type: String,
    default: () => {
      return `USER_${new mongoose.Types.ObjectId().toString()}`;
    },
    trim: true,
    unique: true,
    required: true,
  },
  first_name: {
    type: String,
    trim: true,
    required: [true, "Please enter first name"],
  },
  last_name: {
    type: String,
    trim: true,
    required: [true, "Please enter last name"],
  },
  // dob: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please enter the dob"],
  // },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Please enter the email"],
  },
  //possible values admin or user
  role: {
    type: String,
    default: () => {
      return `user`;
    },
    trim: true,
    enum: ["user", "admin"],
  },
  phone: {
    type: String,
    required: [true, "Please enter the phone"],
  },
  address: {
    type: [address_schema],
  },
  email_otp: {
    type: Number,
  },
  cart: {
    type: [cart_schema],
  },
  wishlist: {
    type: [wishlist_schema],
  },
});

const User = mongoose.model("User", user_schema);

module.exports = User;
