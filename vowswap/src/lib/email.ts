import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailTemplateData = Record<string, string | number | boolean>;

export type SendEmailOptions = {
  to: string;
  templateName: string;
  templateData: EmailTemplateData;
};

export class EmailService {
  private static instance: EmailService;
  private queueCheckInterval: NodeJS.Timeout | null = null;
  private isProcessingQueue = false;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({
    to,
    templateName,
    templateData,
  }: SendEmailOptions) {
    try {
      // Get template from database
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      // Replace variables in template
      let htmlContent = template.htmlContent;
      let textContent = template.textContent;
      let subject = template.subject;

      // Replace variables in all content
      for (const [key, value] of Object.entries(templateData)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, String(value));
        textContent = textContent.replace(regex, String(value));
        subject = subject.replace(regex, String(value));
      }

      // Create email log entry first
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          status: 'QUEUED',
        },
      });

      // Create email queue entry
      const queuedEmail = await prisma.emailQueue.create({
        data: {
          to,
          subject,
          html: htmlContent,
          text: textContent,
          status: 'PENDING',
        },
      });

      // Start queue processing if not already running
      this.startQueueProcessing();

      return queuedEmail;
    } catch (error) {
      console.error('Error queueing email:', error);
      throw error;
    }
  }

  private startQueueProcessing() {
    if (!this.queueCheckInterval) {
      this.queueCheckInterval = setInterval(() => {
        this.processEmailQueue().catch(console.error);
      }, 10000); // Check queue every 10 seconds
    }
  }

  private async processEmailQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      // Get next pending email
      const queuedEmail = await prisma.emailQueue.findFirst({
        where: {
          OR: [
            { status: 'PENDING' },
            {
              status: 'FAILED',
              attempts: { lt: 3 },
            },
          ],
        },
      });

      if (!queuedEmail) {
        this.isProcessingQueue = false;
        return;
      }

      try {
        // Send email using Resend
        await resend.emails.send({
          from: 'VowSwap <noreply@vowswap.com>',
          to: queuedEmail.to,
          subject: queuedEmail.subject,
          html: queuedEmail.html,
        });

        // Find the corresponding email log
        const emailLog = await prisma.emailLog.findFirst({
          where: {
            to: queuedEmail.to,
            subject: queuedEmail.subject,
          },
        });

        // Update queue and log status
        await prisma.$transaction([
          prisma.emailQueue.update({
            where: { id: queuedEmail.id },
            data: {
              status: 'COMPLETED',
              updatedAt: new Date(),
            },
          }),
          ...(emailLog ? [
            prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'SENT',
                updatedAt: new Date(),
              },
            }),
          ] : []),
        ]);
      } catch (error) {
        await prisma.emailQueue.update({
          where: { id: queuedEmail.id },
          data: {
            status: 'FAILED',
            attempts: queuedEmail.attempts + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date(),
          },
        });

        if (queuedEmail.attempts + 1 >= 3) {
          const emailLog = await prisma.emailLog.findFirst({
            where: {
              to: queuedEmail.to,
              subject: queuedEmail.subject,
            },
          });

          if (emailLog) {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                updatedAt: new Date(),
              },
            });
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  public stopQueueProcessing() {
    if (this.queueCheckInterval) {
      clearInterval(this.queueCheckInterval);
      this.queueCheckInterval = null;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
