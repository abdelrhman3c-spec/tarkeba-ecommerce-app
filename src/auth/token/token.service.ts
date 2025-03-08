import { forwardRef, Inject, Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Role } from '../../enums/user-roles.enum';
import { BlacklistService } from '../../redis/blacklist.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private blacklistService: BlacklistService,
    ) {}

    generateVerificationToken(): { verificationToken: string, hashedToken: string, tokenExpiration: Date } {
        const verificationToken = randomBytes(20).toString('hex');
        const hashedToken = createHash('sha256').update(verificationToken).digest('hex');
        const tokenExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return { verificationToken, hashedToken, tokenExpiration };
    }

    generateResetToken() {
      const resetToken = randomBytes(32).toString('hex');
      const hashedToken = createHash('sha256').update(resetToken).digest('hex');
      return { resetToken, hashedToken };
    }

    async generateAccessToken(payload: { userID: string, email: string, role: Role, isVerified: boolean }) {
        return this.jwtService.sign(payload);
    }

    async generateRefreshToken(payload: { userID: string, email: string, role: Role, isVerified: boolean }) {
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_SECRET,
            expiresIn: '7d',
        });
    
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        return {refreshToken, hashedToken};
    }

    verifyResetToken(token: string, hashedToken: string) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      return tokenHash === hashedToken;
    }

    async refreshAccessToken(refreshToken: string) {
      const decodedToken = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_SECRET });
      const user = await this.usersService.findById(decodedToken.userID);

      // Check if the token has been revoked (blacklisted)
      if(decodedToken.role !== Role.CUSTOMER) {
        const isBlacklisted = await this.blacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
          throw new UnauthorizedException('Token has been revoked');
        }
      }

      // Check if the user exists and has a refresh token
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAccessToken(decodedToken);
    }

    async setUserTokens(user: any, @Res() res: Response) {
      const accessToken = await this.generateAccessToken(user);
      const { refreshToken, hashedToken } = await this.generateRefreshToken(user);
      await this.usersService.updateRefreshToken(user.userID, hashedToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
      });

      return res.json({ accessToken, refreshToken });
    }
}
