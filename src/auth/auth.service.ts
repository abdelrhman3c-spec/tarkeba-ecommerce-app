import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AccountLockService } from 'src/redis/account-lock.service';
import { BlacklistService } from 'src/redis/blacklist.service';
import { Role } from 'src/enums/user-roles.enum';
import { TokenService } from './token/token.service';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto ';
import { GoogleUserDto } from './dto/google-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private accountLockService: AccountLockService,
    private blacklistService: BlacklistService,
    private usersService: UsersService,
    private tokenService: TokenService,
    private mailService: MailService
  ) {}

  async login(loginDto: LoginDto, @Res() res: Response) {
    const user = await this.validateUser(loginDto);
    return this.tokenService.setUserTokens(user, res);
  }

  async googleLogin(googleUserDto: GoogleUserDto, @Res() res: Response) {
    let user = await this.usersService.findByEmail(googleUserDto.email);
    if (!user) {
      // Create new user
      user = await this.usersService.createUser({
        name: `${googleUserDto.firstName} ${googleUserDto.lastName}`,
        email: googleUserDto.email,
        googleID: googleUserDto.sub,
        provider: 'google',
        isVerified: true // Google-verified emails are trusted
      });
    } else if (!user.googleID) {
      // Merge existing account with Google
      user = await this.usersService.linkGoogleAccount(user.id, googleUserDto);
    }
  
    return this.tokenService.setUserTokens(user, res);
  }

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Check if the account is locked
    if (await this.accountLockService.isAccountLocked(email)) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }
    
    // Check if the user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');


    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const attempts = await this.accountLockService.incrementFailedAttempts(email);
      if (attempts >= 5) { // Lock after 5 failed attempts
        await this.accountLockService.lockAccount(email);
        throw new UnauthorizedException('Account locked due to too many failed attempts. Try again later.');
      }
  
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.accountLockService.resetFailedAttempts(email);
    return { userID: user._id, email: user.email, role: user.role };
  }

  async logout(userID: string, role: Role, refreshToken: string, @Res() res: Response) {
    // Decode the refresh token to extract its expiration time
    const decodedToken = this.jwtService.decode(refreshToken) as { exp: number };
    if (!decodedToken || !decodedToken.exp) return; // Invalid token
    
    // Delete the refresh token from the user document
    await this.usersService.updateRefreshToken(userID, null);

    // Blacklist the token if it hasn't expired yet
    // * NOTE: Only blacklist tokens for non-customer roles
    const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
    if (role !== Role.CUSTOMER && expiresIn > 0) {
      await this.blacklistService.blacklistToken(refreshToken, expiresIn);
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) return { message: 'Reset password email sent' };

    // Generate reset token
    const { resetToken, hashedToken } = this.tokenService.generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update the user document with the reset token
    await this.usersService.setResetToken(user.id, hashedToken, resetExpires);

    // Send the reset password email
    await this.mailService.sendResetPasswordEmail(email, resetToken);
    return { message: 'Reset password email sent' };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new UnauthorizedException('Invalid reset token');

    // Verify the reset token
    const decodedToken = this.tokenService.verifyResetToken(token, user.resetToken);
    if (!decodedToken) throw new UnauthorizedException('Invalid reset token');

    // Update the user's password
    await this.usersService.setNewPassword(user.id, resetPasswordDto.password);

    // Clear the reset token
    await this.usersService.clearResetToken(user.id);
    return { message: 'Password reset successfully' };
  }
}
