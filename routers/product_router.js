const express = require("express");
const {
  upload_image,
  create_product,
  get_all_products,
  get_product_by_id,
  search_product,
  get_landing_products,
  get_products_by_type,
} = require("../controllers/product_ctrl");

const router = express.Router();

router.route("/create").post(upload_image.any(), create_product);
router.route("/").get(get_all_products);
router.route("/search").get(search_product);
router.route("/get_product/:id").get(get_product_by_id);
router.route("/get_landing_products").get(get_landing_products);
router.route("/get_products_by_type/:type").get(get_products_by_type);

module.exports = router;
