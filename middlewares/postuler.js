const nodemailer = require("nodemailer");

const postuler = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // Assure-toi que cette variable est définie dans ton .env
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Stage Express <no-reply@stageexpress.com>',
    to: options.to, // Correction ici (options.email → options.to)
    subject: options.subject,
    text: options.text, // Correction ici (options.message → options.text)
    html: options.html, // Ajout du support HTML
  };

  await transporter.sendMail(mailOptions);
};

module.exports = postuler;
