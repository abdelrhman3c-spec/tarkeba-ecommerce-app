import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const verificationLink = `${process.env.BASE_URL}/auth/verify?token=${token}`;
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Click the link to verify your email: ${verificationLink}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
