import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../enums/user-roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Determines if a request can proceed based on user roles
  canActivate(context: ExecutionContext): boolean {
    // Get the required roles for the route handler or class
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredRoles);
    // If no roles are required, allow access
    if (!requiredRoles) return true;

    
    // Extract the request object to inspect user
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);
    // If no user or the user's role is not in the required roles, deny access
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    // If the user has one of the required roles, allow access
    return true;
  }
}
