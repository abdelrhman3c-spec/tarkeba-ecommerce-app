import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/users.service';

@Injectable()
export class VerifiedGuard extends JwtAuthGuard {
    constructor(private userService: UsersService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // First verify JWT
        await super.canActivate(context);
        
        const req = context.switchToHttp().getRequest();
        const user = await this.userService.findById(req.user.userID);
        
        if (!user?.isVerified) {
            throw new ForbiddenException('Account verification required');
        }
        
        return true;
    }
}