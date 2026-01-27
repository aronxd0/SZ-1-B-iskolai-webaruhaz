const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function sendEmail(to, subject, html) {
    if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
        throw new Error('Missing EMAIL_FROM or EMAIL_PASSWORD env');
    }		
	
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.APP_PASSWORD,
        }
    });
    const fs = require('fs'); // fajl beolvasasahoz

    const info = await transporter.sendMail({
        from: `"Csány webáruház" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments: [{
            filename: 'logo2.png', // csatolt fajl neve
            content: fs.readFileSync("public/img/logo2.png"), // fajl beolvasasa ami csatolva lesz
            cid: 'logo2@example.com' // azonosi­to a HTML-ben valo hivatkozashoz
        }],
    });

    return info;
}

module.exports = { sendEmail };