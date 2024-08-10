const { default: mongoose } = require("mongoose");
const {
  STRIPE_SECRET_KEY,
  PAYMENT_COMPLETION_URL,
} = require("../config/stripe");
const Order = require("../models/order_model");
const Payment = require("../models/payment_model");
const Product = require("../models/product_model");
const User = require("../models/user_model");
const CustomError = require("../utils/CustomError");
const send_email = require("../utils/send_email");

const create_stripe_payment = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    let user = await User.findOne({ user_id });

    if (!user) {
      return next(new CustomError("Not a valid user", 404));
    }

    let products = [],
      product_name = [],
      amount = 0;

    await Promise.all(
      user.cart.map(async (item) => {
        let product = await Product.findOne({
          product_id: item.product_id,
        }).select("product_id name type price");

        let product_copy = { ...product._doc };

        product_copy.size = item.size;
        product_copy.quantity = item.quantity;

        amount += Number(product.price) * Number(item.quantity);
        product_name.push(product.name);

        products.push(product_copy);
      })
    );

    let payment_id = `${new mongoose.Types.ObjectId().toString()}`;

    let order = new Order({
      user_id: user_id,
      total_amount: amount,
      products: products,
      payment_id: payment_id,
    });
    order = await order.save();

    const stripe = require("stripe")(`${STRIPE_SECRET_KEY}`);

    const stripe_product = await stripe.products.create({
      name: `${user.user_id}__${order.order_id}`,
      active: true,
    });

    if (!stripe_product?.id) {
      return next(new CustomError(`Error in creating stripe product id`, 404));
    }

    amount = amount * 100;
    const stripe_price = await stripe.prices.create({
      currency: "INR",
      unit_amount: amount,
      product: stripe_product?.id,
    });

    if (!stripe_price?.id) {
      return next(new CustomError(`Error in creating stripe price id`, 404));
    }

    const stripe_payment = await stripe.paymentLinks.create({
      line_items: [{ price: stripe_price?.id, quantity: 1 }],
      billing_address_collection: "required",
      metadata: {
        user_id: user_id,
        order_id: order.order_id,
        payment_id: payment_id,
      },
      // after_completion: {
      //   type: "redirect",
      //   redirect: {
      //     url: WEBHOOK_URL,
      //   },
      // },
    });

    console.log(stripe_payment);

    if (!stripe_payment?.url) {
      return next(new CustomError(`Error in creating stripe payment id`, 404));
    }

    let payment = new Payment({
      payment_id: payment_id,
      order_id: order.order_id,
      total_amount: order.total_amount,
      user_id: user_id,
      url: stripe_payment?.url,
    });
    payment = await payment.save();

    return res.status(200).send({
      data: {
        url: stripe_payment?.url,
        products,
      },
      success: true,
      error: null,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const receive_payment = async (req, res, next) => {
  try {
    const stripe_payload = req.body;

    if (stripe_payload?.type === "checkout.session.completed") {
      const payment_status = stripe_payload?.data?.object?.payment_status;
      const user_id = stripe_payload?.data?.object?.metadata?.user_id;
      const payment_id = stripe_payload?.data?.object?.metadata?.payment_id;
      const order_id = stripe_payload?.data?.object?.metadata?.order_id;

      if (payment_status === "paid") {
        let payment = await Payment.findOne({ payment_id });
        payment.status = "Completed";
        await payment.save();

        let order = await Order.findOne({ order_id });
        order.payment_status = "Paid";
        await order.save();

        let user = await User.findOne({ user_id });
        user.cart = [];
        await user.save();

        //Payment Success email to user
        send_email({
          to: user.email,
          subject: "Payment for order has been completed successfully!",
        });

        //Reduce the quantity in products
        await Promise.all(
          order.products.map(async (item) => {
            let product = await Product.findOne({
              product_id: item?.product_id,
            });

            product.size[item.size] =
              Number(product.size[item.size]) - Number(item.quantity);
            product.total = Number(product.total) - Number(item.quantity);

            await product.save();
          })
        );
      }
    }

    console.log(stripe_payload);
    return;
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

module.exports = { create_stripe_payment, receive_payment };
