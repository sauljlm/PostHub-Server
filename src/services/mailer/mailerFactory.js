require("dotenv").config();

const MailerService = require("./MailerService");

function createMailerService() {
    return new MailerService({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
}

module.exports = createMailerService;