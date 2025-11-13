function sendEmail() {

        console.log("Sending email...");

        const nodemailer = require('nodemailer');
        require('dotenv').config();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.USER ,
            pass: process.env.APP_PASSWORD ,
        },
        });

        const mailOptions ={
            from: {
                name: 'Csany webbolt',
                address: process.env.USER,
            },
            to: "szaloky.aron@csany-zeg.hu",
            subject: "Visszaigazolás",
            text: "AKASSZAD FEL MAGAD", // plain‑text body
            html: "<b>AKASSZAD FEL MAGAD</b>", // HTML body
        };

        const sendMail = async (transporter,mailOptions ) => {
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully");
            }
            catch (error) {
                console.error("Error sending email:", error);
            }
        }
        sendMail(transporter, mailOptions);

}

function sendEmailToBackend(userName, userEmail, emailContent, subject = 'Értesítés') {
    const params = new URLSearchParams({
        name: userName,
        email: userEmail,
        html: emailContent,
        subject: subject
    }).toString();

    return fetch(`/send-email?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json());
}