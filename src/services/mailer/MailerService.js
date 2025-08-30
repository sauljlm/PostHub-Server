const nodemailer = require("nodemailer");

class MailerService {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
  }

  async sendMail({ from, to, subject, text, html }) {
    const info = await this.transporter.sendMail({ from, to, subject, text, html });
    console.log("Mensaje enviado:", info.messageId);
    return info;
  }
}

module.exports = MailerService;