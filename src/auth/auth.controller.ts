import { Controller, Post, Body, UseGuards, Get, ValidationPipe, UsePipes, Res, Req, Query } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.userService.verifyUser(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() { email }) {
    return this.userService.resendVerification(email);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req: any) {
    const refreshToken = req.cookies['refreshToken'];
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  async logout(@Req() req: any, @Res() res: Response) {
    const { userID, role } = req.user;
    const refreshToken = req.cookies['refreshToken'];
    console.log(refreshToken);
    await this.authService.logout(userID, role, refreshToken, res);
  }
}
