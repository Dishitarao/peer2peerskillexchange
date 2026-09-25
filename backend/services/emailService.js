const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user || 'ethereal_user',
        pass: config.email.pass || 'ethereal_pass'
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!config.email.user) {
        console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
        return { messageId: 'simulated-id' };
      }

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('[Email Error]:', error.message);
      // Non-blocking in dev
      return null;
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to P2P Skill Exchange!',
      text: `Hello ${user.firstName},\n\nWelcome to P2P Skill Exchange! You have been credited with ${config.initialCredits} starter credits to begin learning and teaching.\n\nHappy sharing!`,
      html: `<h3>Welcome, ${user.firstName}!</h3><p>We are thrilled to have you in our P2P Skill Exchange community.</p><p>You have received <strong>${config.initialCredits} platform credits</strong> to get started!</p>`
    });
  }

  async sendPasswordResetEmail(user, resetUrl) {
    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - P2P Skill Exchange',
      text: `Hello ${user.firstName},\n\nYou requested a password reset. Please click the link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hello ${user.firstName},</p><p>You requested a password reset. Click below to set a new password:</p><a href="${resetUrl}">Reset Password</a><p>Link expires in 1 hour.</p>`
    });
  }
}

module.exports = new EmailService();
