import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // In a real application, you would use a service like SendGrid, AWS SES, or Nodemailer
    // For now, we'll just log the email details
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    this.logger.log(`Password reset email would be sent to: ${email}`);
    this.logger.log(`Reset URL: ${resetUrl}`);
    
    // TODO: Implement actual email sending
    // Example with Nodemailer:
    // await this.transporter.sendMail({
    //   from: this.configService.get('EMAIL_FROM'),
    //   to: email,
    //   subject: 'Password Reset Request',
    //   html: this.getPasswordResetTemplate(resetUrl),
    // });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.logger.log(`Welcome email would be sent to: ${email} for user: ${name}`);
    
    // TODO: Implement actual email sending
  }

  async sendTaskAssignmentEmail(email: string, taskTitle: string, projectName: string): Promise<void> {
    this.logger.log(`Task assignment email would be sent to: ${email} for task: ${taskTitle} in project: ${projectName}`);
    
    // TODO: Implement actual email sending
  }

  async sendProjectInvitationEmail(email: string, projectName: string, inviterName: string): Promise<void> {
    this.logger.log(`Project invitation email would be sent to: ${email} for project: ${projectName} by: ${inviterName}`);
    
    // TODO: Implement actual email sending
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;
  }
} 