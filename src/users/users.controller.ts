import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    getProfile(@Req() req: any) {
        console.log(req.user);
        return req.user;
    }
}
