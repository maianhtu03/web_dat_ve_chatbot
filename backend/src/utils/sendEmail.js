const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Cấu hình "người vận chuyển"
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Nội dung email
    const mailOptions = {
        from: `"MTU Cinemas" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 3. Thực hiện gửi
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;