import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Extract the request object to inspect headers
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check if the token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    
    // Use the default behavior (calls JwtAccessStrategy.validate())
    if (!user) throw new UnauthorizedException('Invalid token');

    // Set the user object in the request
    request.user = user;

    return user;
  }
}
