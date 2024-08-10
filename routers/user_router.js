const express = require("express");
const {
  create_user,
  valid_user,
  get_address,
  add_new_address,
  get_user,
  validate_user_by_email_otp,
  login,
  add_to_cart,
  add_to_wishlist,
  get_wishlists,
  get_carts,
  delete_product_in_cart,
} = require("../controllers/user_ctrl");

const router = express.Router();

router.route("/create").post(create_user);
router
  .route("/address")
  .get(valid_user, get_address)
  .post(valid_user, add_new_address)
  .patch(valid_user);
router.route("/get_user/:user_id").get(get_user);
router.route("/login").post(login);
router.route("/validate_user_by_email_otp").post(validate_user_by_email_otp);

router.route("/add_to_cart").post(valid_user, add_to_cart);
router.route("/add_to_wishlist").post(valid_user, add_to_wishlist);
router.route("/get_wishlists").get(get_wishlists);
router.route("/get_carts").get(get_carts);
router.route("/delete_product_in_cart").post(delete_product_in_cart);

module.exports = router;
