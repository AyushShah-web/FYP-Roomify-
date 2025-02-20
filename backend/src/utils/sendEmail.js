import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "Ayush <ayush@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
