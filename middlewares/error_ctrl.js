module.exports = async (error, req, res, next) => {
  error.code = error.code || 500;

  res.status(error.code).send({
    error: true,
    message: error?.message,
    success: false,
  });
};
