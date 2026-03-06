import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendRegistrationEmail = async (userEmail, name) => {
  const subject = "Welcome to Banking-Ledger";
  const text = `<p>Hello ${name}</p><p>Thank you for registering with Banking-Ledger. We're excited to have you on board!</p>`;
  const html = `<p>Hello ${name}</p></p><p>Thank you for registering with <b>Banking-Ledger</b>. We're excited to have you on board!</p>`;

  await sendEmail(userEmail, subject, text, html);
};

/**
 * send email notification for successful transactions
 */
export const sendTransactionEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
) => {
  const subject = "Transaction Successful";
  const text = `<p>Hello ${name}</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p>`;
  const html = `<p>Hello ${name}</p><p>Your transaction of <b>$${amount}</b> to account <b>${toAccount}</b> was successful.</p>`;

  await sendEmail(userEmail,subject,text,html)
};
