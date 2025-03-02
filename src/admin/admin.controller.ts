import { Controller, Get, UseGuards, Request, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/user-roles.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {

    @Get()
        @UseGuards(AuthGuard('jwt-access'), RolesGuard)
        @Roles(Role.ADMIN)
        getAdminDashboard(@Req() req: any) {
            return { message: 'Welcome, Admin!', user: req.user };
    }
}
