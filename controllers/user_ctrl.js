const Product = require("../models/product_model");
const User = require("../models/user_model");
const CustomError = require("../utils/CustomError");
const generate_otp = require("../utils/generate_otp");
const send_email = require("../utils/send_email");

const create_user = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();

    return res.send({ error: null, data: user, success: true }).status(200);
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const valid_user = async (req, res, next) => {
  try {
    let { user_id } = req.body;

    let user = await User.findOne({ user_id });

    if (!user) {
      return res
        .send({ message: "", error: null, success: false, data: null })
        .status(400);
    }

    next();
  } catch (error) {
    return res
      .send({ error: error.message, success: false, data: null })
      .status(500);
  }
};

const get_address = async (req, res) => {
  try {
    let { user_id } = req.body;

    let user = await User.findOne({ user_id }).select("address user_id email");

    if (user.address.length) {
      return res
        .send({
          error: null,
          success: true,
          data: user,
        })
        .status(200);
    }

    return res
      .send({
        error: null,
        success: true,
        data: { address: [] },
      })
      .status(400);
  } catch (error) {
    return res
      .send({
        error: error.message,
        success: false,
        data: null,
      })
      .status(500);
  }
};

const add_new_address = async (req, res, next) => {
  try {
    const { address, user_id } = req.body;

    let user = await User.findOne({ user_id });

    let address_copy = [...user.address];

    address_copy.push(address);

    user.address = address_copy;
    await user.save();

    return res.status(200).send({
      success: true,
      data: {},
      error: null,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const get_user = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    console.log(user_id);

    const user = await User.findOne({ user_id });

    if (!user) {
      return next(new CustomError("No user found", 404));
    }

    return res.status(200).send({ error: null, success: true, data: user });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const login = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).send({
        error: null,
        data: {},
        message:
          "Dont have a account with this email, please create a new account",
        success: false,
      });
    }

    let otp = generate_otp();

    await send_email({
      to: email,
      subject: "Your Ziara OTP",
      html: `<p>Hello ${user.first_name} ${user.last_name},</p>
            <p>Hi,</p>
            <p>Welcome to ZIARA! We're excited to have you!</p>
            <p>Please use this OTP to complete your login / signup process -</p>
            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; fsont-size:2rem">${otp}</p>
            <p>Best wishes,<br>ZIARA</p>`,
    });

    user.email_otp = otp;
    await user.save();

    return res.status(200).send({
      error: null,
      data: {},
      message: "Email sent successfully",
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const validate_user_by_email_otp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, email_otp: otp });

    if (!user) {
      return res.status(200).send({
        error: null,
        data: {},
        message: "Incorrect otp",
        success: false,
      });
    }

    //clears the otp
    user.email_otp = null;
    await user.save();

    return res
      .send({
        error: null,
        data: {
          user_id: user.user_id,
        },
        message: "Logged in successfully",
        success: true,
      })
      .status(200);
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const add_to_cart = async (req, res) => {
  try {
    const { quantity, size, product_id, user_id } = req.body;

    const user = await User.findOne({ user_id });

    const cart = { quantity, size, product_id };

    user.cart.push(cart);
    await user.save();

    return res.status(200).send({
      error: null,
      data: {},
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const add_to_wishlist = async (req, res) => {
  try {
    const { product_id, user_id } = req.body;

    const user = await User.findOne({ user_id });

    const wishlist = { product_id };

    user.wishlist.push(wishlist);
    await user.save();

    return res.status(200).send({
      error: null,
      data: {},
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const get_wishlists = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    const user = await User.findOne({ user_id });

    if (!user) {
      return next(new CustomError("Not a valid customer", 404));
    }

    let wishlist = await Promise.all(
      user.wishlist.map(async (list) => {
        let item = await Product.findOne({
          product_id: list.product_id,
        }).select("product_id name images description price link");

        let image, contentType;

        //converting buffer to base64
        if (item.images.length) {
          image = item.images[0].src.data.toString("base64");
          contentType = item.images[0].src.contentType;
        }

        return {
          name: item.name,
          product_id: item.product_id,
          image: image ? `data:${contentType};base64,${image}` : null,
          description: item.description,
          price: item.price,
          link: item.link,
        };
      })
    );

    return res.status(200).send({
      error: null,
      data: {
        wishlist: wishlist,
        user_id: user.user_id,
      },
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const get_carts = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    const user = await User.findOne({ user_id });

    if (!user) {
      return next(new CustomError("Not a valid customer", 404));
    }

    let cart = await Promise.all(
      user.cart.map(async (list) => {
        let item = await Product.findOne({
          product_id: list.product_id,
        }).select("product_id name images description price link");

        let image, contentType;

        //converting buffer to base64
        if (item.images.length) {
          image = item.images[0].src.data.toString("base64");
          contentType = item.images[0].src.contentType;
        }

        return {
          name: item.name,
          product_id: item.product_id,
          image: image ? `data:${contentType};base64,${image}` : null,
          description: item.description,
          price: item.price,
          link: item.link,
          quantity: list.quantity,
          size: list.size,
        };
      })
    );

    return res.status(200).send({
      error: null,
      data: {
        cart: cart,
        user_id: user.user_id,
      },
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

const delete_product_in_cart = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.body;

    const user = await User.findOne({ user_id });

    if (!user) {
      return next(new CustomError("Not a valid user", 404));
    }
    let cart_copy = [...user.cart].filter(
      (item) => item.product_id !== product_id
    );

    user.cart = cart_copy;
    await user.save();

    return res.status(200).send({
      success: true,
      data: cart_copy,
      error: null,
    });
  } catch (error) {
    return next(new CustomError(error.message, 404));
  }
};

module.exports = {
  create_user,
  add_new_address,
  valid_user,
  get_address,
  get_user,
  login,
  validate_user_by_email_otp,
  add_to_cart,
  add_to_wishlist,
  get_wishlists,
  get_carts,
  delete_product_in_cart,
};
