const multer = require("multer");
const Product = require("../models/product_model");
const CustomError = require("../utils/CustomError");
const storage = multer.memoryStorage();

const upload_image = multer({ storage });

const create_product = async (req, res, next) => {
  try {
    const { name, tags, type, size, price, description, total } = req.body;
    const images = req.files;
    const product = new Product({
      name,
      tags,
      type,
      size,
      price,
      description,
      total,
      link: name.split(" ").join("-").toLowerCase(),
    });

    let images_array = [];
    if (images.length) {
      for (let i = 0; i < images.length; i++) {
        images_array.push({
          src: {
            data: images[i].buffer,
            contentType: images[i].mimetype,
          },
          product_id: product.product_id,
          alt: images[i]?.alt,
        });
      }

      product.images = images_array;
    }

    await product.save();

    return res
      .send({ data: { id: product.product_id }, error: null, status: true })
      .status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

const get_all_products = async (req, res, next) => {
  try {
    const { page } = req.query;

    let limit = 20;

    const products = await Product.find()
      .limit(limit)
      .skip(limit * page);

    let total_products = await Product.countDocuments();

    return res
      .send({
        data: { products, total: total_products },
        error: null,
        status: true,
      })
      .status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

const get_product_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findOne({ link: id });
    let images = [];

    if (product) {
      //converting buffer to base64
      if (product.images.length) {
        images = product.images.map((img) => {
          let image = img.src.data.toString("base64");
          let contentType = img.src.contentType;

          return `data:${contentType};base64,${image}`;
        });
      }

      const mod_product = { ...product._doc, images };
      return res
        .send({ data: mod_product, error: null, status: true })
        .status(200);
    }

    return res.send({ data: null, error: null, status: false }).status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

const search_product = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return next(new CustomError(`Search text should not be empty`, 400));
    }

    const limit = 8;

    // "i" for case-sensitive
    const regex = new RegExp(query, "i");

    //select -> get those specific fields
    let products = await Product.find({
      tags: { $regex: regex },
    })
      .select("name product_id images price")
      .limit(limit);

    products = products.map((item) => {
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
      };
    });

    res.send({ data: products, error: true, success: true }).status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

const get_landing_products = async (req, res, next) => {
  try {
    let recent_products = await Product.find().sort({ _id: -1 }).limit(5);

    recent_products = recent_products.map((item) => {
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
    });

    let shirts = await Product.find({ type: "shirts" }).limit(5);
    shirts = shirts.map((item) => {
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
    });

    let pants = await Product.find({ type: "pants" }).limit(5);
    pants = pants.map((item) => {
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
    });

    let tshirts = await Product.find({ type: "t-shirts" }).limit(5);
    tshirts = tshirts.map((item) => {
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
    });

    return res
      .send({
        success: true,
        error: null,
        data: { recent: recent_products, shirts, pants, tshirts },
      })
      .status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

const get_products_by_type = async (req, res, next) => {
  try {
    const { page } = req.query;
    const { type } = req.params;

    let limit = 20;

    let products = await Product.find({ type })
      .limit(limit)
      .skip(limit * page);

    products = products.map((item) => {
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
    });

    let total_products = await Product.countDocuments({ type });

    return res
      .send({
        data: { products, total: total_products },
        error: null,
        status: true,
      })
      .status(200);
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

module.exports = {
  create_product,
  upload_image,
  get_all_products,
  get_product_by_id,
  search_product,
  get_landing_products,
  get_products_by_type,
};
