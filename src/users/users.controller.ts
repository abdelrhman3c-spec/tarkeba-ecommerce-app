import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    @UseGuards(AuthGuard('jwt-access'))
    getProfile(@Req() req: any) {
        console.log(req.user);
        return req.user;
    }
}
