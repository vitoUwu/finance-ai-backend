import nodemailer from "nodemailer";
import {
  INotificationProvider,
  NotificationContent,
} from "../INotificationProvider.js";
import { IUsersRepository } from "../../../../domain/repositories/IUsersRepository.js";
import { LoggerService } from "../../../services/LoggerService.js";

export class EmailNotificationProvider implements INotificationProvider {
  private transporter: nodemailer.Transporter;

  constructor(private usersRepository: IUsersRepository) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(userId: string, content: NotificationContent): Promise<void> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: content.title,
        html: this.formatEmailBody(content),
      });

      LoggerService.info({
        message: "Email notification sent",
        metadata: {
          userId,
          title: content.title,
        },
      });
    } catch (error) {
      LoggerService.error({
        message: "Failed to send email notification",
        metadata: { userId },
        error: error as Error,
      });
      throw error;
    }
  }

  private formatEmailBody(content: NotificationContent): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${content.title}</h2>
        <p>${content.body}</p>
        ${this.formatMetadata(content.data)}
      </div>
    `;
  }

  private formatMetadata(data?: Record<string, string>): string {
    if (!data) return "";

    return `
      <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5;">
        ${Object.entries(data)
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
          .join("")}
      </div>
    `;
  }
}
