import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // tells node to use Gmail to send emails
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});
