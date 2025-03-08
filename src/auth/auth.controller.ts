import { Controller, Post, Body, UseGuards, Get, ValidationPipe, UsePipes, Res, Req, Query } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token/token.service';
import { MailService } from '../mail/mail.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto ';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private userService: UsersService,
    private tokenService: TokenService,
    private mailService: MailService
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
  @UsePipes(ValidationPipe)
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.mailService.resendVerification(resendVerificationDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    console.log('user info:', user);
    res.json(user);
    //res.redirect(`http://your-frontend-url.com?token=${jwt}`);
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
    await this.authService.logout(userID, role, refreshToken, res);
  }

  @Post('forgot-password')
  @UsePipes(ValidationPipe)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @UsePipes(ValidationPipe)
  async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}
