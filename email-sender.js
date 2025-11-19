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
    const fs = require('fs'); // fájl beolvasásához

    const info = await transporter.sendMail({
        from: `"Csány webaruhaz" <${process.env.USER}>`,
        to,
        subject,
        html,
        attachments: [{
            filename: 'logo2.png', // csatolt fájl neve
            content: fs.readFileSync("public/img/logo2.png"), // fájl beolvasása ami csatolva lesz
            cid: 'logo2@example.com' // azonosító a HTML-ben való hivatkozáshoz
        }],
    });

    return info;
}

module.exports = { sendEmail };