import { Controller, Get, UseGuards, Request, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/user-roles.enum';

@Controller('admin')
export class AdminController {
    @Get('/dashboard')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAdminDashboard(@Req() req: any) {
        return { message: 'Welcome, Admin!', user: req.user };
    }
}
