import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ResendVerificationDto } from 'src/auth/dto/resend-verification.dto';
import { TokenService } from 'src/auth/token/token.service';
import { UsersService } from 'src/users/users.service';
import { SendEmailDto } from './dto/send-email.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MailService {
    constructor(
        @InjectQueue('email-queue') 
        private mailQueue: Queue,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private tokenService: TokenService,
    ) {}

    async sendMail(sendEmailDto: SendEmailDto): Promise<void> {
        const { recipients, subject, html } = sendEmailDto;
        const mailOptions = { to: recipients, subject, html };
        await this.mailQueue.add('send-email', mailOptions);
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const verificationLink = `${process.env.BASE_URL}/auth/verify?token=${token}`;
        const html = `Click the link to verify your email: ${verificationLink}`; 
        const subject  = 'Email Verification';
        await this.sendMail({ recipients: email, subject, html });
    }

    async resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
        const { email } = resendVerificationDto;
        const user = await this.usersService.findByEmail(email);
        
        if (!user) return { message: 'email send successfully' };
        if (user.isVerified) throw new BadRequestException('Email already verified');

        // Generate a new verification token
        const { verificationToken, hashedToken, tokenExpiration } = this.tokenService.generateVerificationToken();

        // Update the user document
        await this.usersService.setVerificationToken(user.id, hashedToken, tokenExpiration);

        // Send the verification email
        await this.sendVerificationEmail(email, verificationToken);
    }

    async sendResetPasswordEmail(email: string, token: string): Promise<void> {
        const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;
        const html = `Click the link to reset your password: ${resetLink}`;
        const subject = 'Password Reset';
        await this.sendMail({ recipients: email, subject, html });
    }
}
