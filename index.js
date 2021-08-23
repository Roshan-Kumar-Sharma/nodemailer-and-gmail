const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
    res.send("Go to /send to send email");
});

app.get("/send", async (req, res) => {
    const message = await sendMail();

    res.send(message);
});

async function sendMail() {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const tranporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.USER_GMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: process.env.USER_GMAIL, //Your email address
            to: "Receipient Email",
            subject: "Subject",
            text: "Sending hello from my nodemailer and gmail API",
            html: { path: "./email-templates/index.html" },
        };

        const result = await tranporter.sendMail(mailOptions);
        console.log("email sent...");
        return result;
    } catch (err) {
        console.log("Error occured", err);
        return err;
    }
}

app.listen(3000, () => {
    console.log("server is running at port 3000");
});
