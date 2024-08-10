const isValidToken = async (req, res) => {
  try {
    let auth_token = req.headers["authorization"];

    if (!auth_token) {
      return res
        .send({
          error: null,
          success: false,
          data: null,
          message: "Authorization header value is missing",
        })
        .status(403);
    }
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

module.exports = { isValidToken };
