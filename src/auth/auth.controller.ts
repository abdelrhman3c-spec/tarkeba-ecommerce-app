import { Controller, Post, Body, UseGuards, Get, ValidationPipe, UsePipes, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './roles.guard';
import { Role } from 'src/enums/user-roles.enum';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UsersService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
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
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  async logout(@Req() req: any, @Res() res: Response) {
    const { userID, role } = req.user;
    const refreshToken = req.cookies['refreshToken'];
    console.log(refreshToken);
    await this.authService.logout(userID, role, refreshToken, res);
  }

  // * ------------------ users profile ------------------ *//
  @Get('profile')
  @UseGuards(AuthGuard('jwt-access'))
  getProfile(@Req() req: any) {
    console.log(req.user);
    return req.user;
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(Role.ADMIN)
  adminOnly(@Req() req: any) {
    return { message: 'Welcome, Admin!', user: req.user };
  }

  // * -------------------------------------------------- * //
}
