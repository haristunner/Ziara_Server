const mongoose = require("mongoose");

const payment_schema = new mongoose.Schema(
  {
    payment_id: {
      type: String,
      trim: true,
    },
    order_id: {
      type: String,
      trim: true,
    },
    total_amount: {
      type: Number,
    },
    user_id: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    completed_date: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: "Created",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", payment_schema);

module.exports = Payment;
