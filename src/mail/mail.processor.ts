import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { InternalServerErrorException } from '@nestjs/common/exceptions';

@Processor('email-queue')
export class MailQueueProcessor {
    constructor(private readonly mailerService: MailerService) {}

    @Process('send-email')
    async sendEmail(job: Job): Promise<{ message: string; }> {
        const { to, subject, html } = job.data;
        await this.mailerService.sendMail({ to, subject, html });
        return { message: 'email sent successfully' }
    } catch(err: unknown) {
        console.error(`Error while sending email`, err);
        throw new InternalServerErrorException('Failed to send email')
    }
}