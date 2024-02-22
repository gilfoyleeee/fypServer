// //SendGrid API for sending email

// const sendGridMail = require("@sendgrid/mail");

// const dotenv = require("dotenv");
// dotenv.config({ path: "../config.env" });

// sendGridMail.setApiKey(process.env.SENDGRIDMAIL_KEY);

// const sgMail = async ({
//   recipent,
//   sender,
//   subject,
//   html,
//   text,
//   attachments,
// }) => {
//   try {
//     const from = sender || "";

//     const mailMsg = {
//       to: recipent, //email of recipent
//       from: from, //email sender
//       subject,
//       html: html,
//       text: text,
//       attachments,
//     };
//     return sendGridMail.send(mailMsg);
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.sendMail = async (args) => {
//   if (process.env.NODE_ENV === "development") {
//     return new Promise.resolve();
//   } else {
//     return sgMail(args);
//   }
// };

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'YourEmailServiceProvider', // e.g., 'Gmail'
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD // Your email password or app-specific password
  }
});

// Function to send email using nodemailer
const sendMail = async ({ recipient, sender, subject, html, text, attachments }) => {
  try {
    const mailOptions = {
      from: sender || process.env.EMAIL_USER, // sender address
      to: recipient, // list of receivers
      subject: subject, // Subject line
      html: html, // HTML body
      text: text, // plain text body
      attachments: attachments // array of attachment objects
    };
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (args) => {
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve();
  } else {
    return sendMail(args);
  }
};
