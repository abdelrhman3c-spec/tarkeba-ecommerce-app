import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.schema';
import { User as UserInterface } from '../interfaces/user'
import { RegisterDto } from 'src/auth/dto/register.dto';
import { MailService } from 'src/mail/mail.service';
import { TokenService } from '../auth/token/token.service';
import { GoogleUserDto } from 'src/auth/dto/google-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private mailService: MailService,
        private tokenService: TokenService
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }
    
    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findByResetToken(token: string): Promise<User | null> {
        const hashedToken = createHash('sha256').update(token).digest('hex');
        return this.userModel.findOne({ resetToken: hashedToken }).exec();
    }

    async updateUser(userID: string, userInfo: any) {
        return this.userModel.findByIdAndUpdate(userID, userInfo, { new: true }).exec();
    }

    async register(registerDto: RegisterDto): Promise<User> {
        try {
            const { name, email, password } = registerDto;
            
            // Check if the email already exists
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                throw new ConflictException('This email is already exists');
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const { verificationToken, hashedToken, tokenExpiration } = this.tokenService.generateVerificationToken();

            // Create a new user
            const userInfo = { 
                name, 
                email, 
                password: hashedPassword, 
                verificationToken: hashedToken, 
                tokenExpiration
            };
            const user = await this.createUser(userInfo);

            // Send verification email
            await this.mailService.sendVerificationEmail(email, verificationToken);

            return user;
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException('Database error occurred');
        }
    }

    // TODO: change the argument type
    async createUser(userObject: any) {
        // Create a new user
        const user = await this.userModel.create(userObject);
        return user;
    }

    async verifyUser(token: string): Promise<{ message: string }> {
        // Hash the token to compare it with the stored token
        const hashedToken = createHash('sha256').update(token).digest('hex');
        const user = await this.userModel.findOne({ verificationToken: hashedToken });
    
        // Check if the token is valid
        if (!user) {
            throw new NotFoundException('Invalid or expired verification token');
        }

        // Check if the user is already verified
        if(user.isVerified) {
            throw new BadRequestException('Email already verified');
        }

        // Check if the token has expired
        if (user.tokenExpiration < new Date()) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        // Update the user document
        await this.userModel.findByIdAndUpdate(user._id, { isVerified: true, verificationToken: null, tokenExpiration: null }).exec();
    
        return { message: 'Email successfully verified' };
    }

    async updateRefreshToken(userID: string, refreshToken: string | null) {
        try {
            return this.updateUser(userID, { refreshToken });
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException('Database error occurred');
        }
    }

    async linkGoogleAccount(userID: string, googleUser: GoogleUserDto) {
        try {
            return this.updateUser(userID, googleUser);
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException('Database error occurred');
        }
    }

    async setVerificationToken(userID: string, verificationToken: string, tokenExpiration: Date) {
        await this.userModel.findByIdAndUpdate(userID, { verificationToken, tokenExpiration }).exec();
    }

    async setResetToken(userID: string, resetToken: string, resetExpires: Date) {
        await this.userModel.findByIdAndUpdate(userID, { resetToken, resetExpires }).exec();
    }

    async setNewPassword(userID: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userModel.findByIdAndUpdate(userID, { password: hashedPassword }).exec();
    }

    async clearResetToken(userID: string) {
        await this.userModel.findByIdAndUpdate(userID, { resetToken: null, resetExpires: null }).exec();
    }
}
