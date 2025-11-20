'use strict';
import nodemailer from 'nodemailer';
import { render } from 'react-email';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email could not be sent.');
    }
  }
}

export const sendConferenceEmail = async (conferenceDetails) => {
  const emailService = new EmailService();
  const htmlContent = render(<EmailTemplate conferenceDetails={conferenceDetails} />);
  await emailService.sendEmail(conferenceDetails.email, 'Conference Information', htmlContent);
};

class EmailTemplate {
  constructor({ conferenceDetails }) {
    this.conferenceDetails = conferenceDetails;
  }

  render() {
    return `<h1>Your conference details</h1><p>${this.conferenceDetails.name}</p>`;
  }
}