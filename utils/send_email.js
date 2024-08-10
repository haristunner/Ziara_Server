const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.PASS,
    },
    service: "gmail",
  });

  transporter.sendMail(
    {
      from: process.env.FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
    },
    (error, info) => {
      if (error) {
        return false;
      }
      return true;
    }
  );
};
