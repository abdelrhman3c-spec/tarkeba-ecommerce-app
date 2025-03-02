import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
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

    async generateAccessToken(payload: {userID: string, email: string, role: Role}) {
        return this.jwtService.sign({
            userID: payload.userID,
            email: payload.email,
            role: payload.role,
        });
    }

    async generateRefreshToken(payload: { userID: string, email: string, role: Role }) {
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_SECRET,
            expiresIn: '7d',
        });
    
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        return {refreshToken, hashedToken};
    }

    async refreshAccessToken(refreshToken: string) {
        try {
          const decodedToken = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_SECRET });
          const user = await this.usersService.findById(decodedToken.userID);
    
          // Check if the user exists and has a refresh token
          if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
          }
    
          // Check if the token has been revoked (blacklisted)
          if(decodedToken.role !== Role.CUSTOMER) {
            const isBlacklisted = await this.blacklistService.isTokenBlacklisted(refreshToken);
            if (isBlacklisted) {
              throw new UnauthorizedException('Token has been revoked');
            }
          }
    
          return this.generateAccessToken(decodedToken);
        } catch (err) {
          console.log(err);
          throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
