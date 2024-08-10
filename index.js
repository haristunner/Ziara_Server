const express = require("express");
const app = express();

app.use(express.json());

const cors = require("cors");
app.use(cors());

const { MONGO_DB_URI, PORT } = require("./config/config");
const db = require("mongoose");

db.connect(MONGO_DB_URI)
  .then((res) => {
    console.log(`DB CONNECTED`);
  })
  .catch((err) => {
    console.log(`ERROR IN CONNECTING DB`, err.message);
  });

const error_middleware = require("./middlewares/error_ctrl");
const productRouter = require("./routers/product_router");
const userRouter = require("./routers/user_router");
const paymentRouter = require("./routers/payment_router");

app.use("/api/product", productRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);

app.use(error_middleware);

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT}`);
});
