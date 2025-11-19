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
    const fs = require('fs');

    const info = await transporter.sendMail({
        from: `"Csany webaruhaz" <${process.env.USER}>`,
        to,
        subject,
        html,
        attachments: [{
            filename: 'logo2.png',
            content: fs.readFileSync("public/img/logo2.png"),
            cid: 'logo2@example.com' // same cid value as in the html img src
        }],
    });

    return info;
}

module.exports = { sendEmail };