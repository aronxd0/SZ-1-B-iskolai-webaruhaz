const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function sendEmail(to, subject, html) {
    if (!process.env.USER || !process.env.APP_PASSWORD) {
        throw new Error('Missing EMAIL_FROM or EMAIL_PASSWORD env');
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.APP_PASSWORD,
        }
    });

    const info = await transporter.sendMail({
        from: `"Csany webbolt" <${process.env.USER}>`,
        to,
        subject,
        html
    });

    return info;
}

module.exports = { sendEmail };