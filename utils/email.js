const nodeMailer = require('nodemailer');

const sendEmail = async function (options) {
  // 1) Create a transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Omobolaji Sonde <omobolajisonde@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.body,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
