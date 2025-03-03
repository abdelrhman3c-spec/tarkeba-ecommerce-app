// src/auth/strategies/jwt-refresh.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { BlacklistService } from 'src/redis/blacklist.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private BlacklistService: BlacklistService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies?.refreshToken) {
      return req.cookies.refreshToken;
    }
    
    return null;
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refreshToken || req.get('Authorization')?.replace('Bearer ', '');
    // Check if the refresh token is provided
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // Check Redis blacklist
    const isBlacklisted = await this.BlacklistService.isTokenBlacklisted(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    return {
      userID: payload.userID,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
      refreshToken,
    };
  }
}