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
  service: 'gmail', // e.g., 'Gmail'
  auth: {
    user: "kushalthapa023@gmail.com", // Your email address
    pass: "rffksuvwoyabbitv" // Your email password or app-specific password
  }
});

// Function to send email using nodemailer
const sendMail = async ({ sender, reciever, subject, html, text, attachments }) => {
  try {
    const mailOptions = {
      sender: "kushalthapa023@gmail.com", // sender address
      reciever: user.email, // list of receivers
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
