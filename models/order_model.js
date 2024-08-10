const mongoose = require("mongoose");

const order_schema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      trim: true,
      default: () => {
        return `ORDER_${new mongoose.Types.ObjectId().toString()}`;
      },
    },
    total_amount: {
      type: Number,
    },
    payment_id: {
      type: String,
      trim: true,
    },
    user_id: { type: String, trim: true },
    products: {
      type: Array,
    },
    payment_status: {
      type: String,
      trim: true,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", order_schema);
module.exports = Order;
