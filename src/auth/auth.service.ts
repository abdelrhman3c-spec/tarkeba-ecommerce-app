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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private accountLockService: AccountLockService,
    private blacklistService: BlacklistService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async login(loginDto: LoginDto, @Res() res: Response) {
    const user = await this.validateUser(loginDto);
    const accessToken = await this.tokenService.generateAccessToken(user);
    const { refreshToken, hashedToken } = await this.tokenService.generateRefreshToken(user);
    await this.usersService.updateRefreshToken(user.userID, hashedToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return res.json({ accessToken });
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
    if (role !== Role.CUSTOMER) { // Only blacklist tokens for non-customer roles
      const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) { // Blacklist the token if it hasn't expired yet
        await this.blacklistService.blacklistToken(refreshToken, expiresIn);
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
