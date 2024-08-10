const express = require("express");
const {
  create_stripe_payment,
  receive_payment,
} = require("../controllers/payment_ctrl");

const router = express.Router();

router.route("/create_payment").post(create_stripe_payment);
router.route("/receive_webhook").post(receive_payment);

module.exports = router;
