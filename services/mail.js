//SendGrid API for sending email

const sendGridMail = require("@sendgrid/mail");

const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

sendGridMail.setApiKey(process.env.SENDGRIDMAIL_KEY);

const sgMail = async ({
  recipent,
  sender,
  subject,
  html,
  text,
  attachments,
}) => {
  try {
    const from = sender || "";

    const mailMsg = {
      to: recipent, //email of recipent
      from: from, //email sender
      subject,
      html: html,
      text: text,
      attachments,
    };
    return sendGridMail.send(mailMsg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return new Promise.resolve();
  } else {
    return sgMail(args);
  }
};
