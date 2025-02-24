import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Extract the request object to inspect headers
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // Check if the token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    
    // Otherwise, use the default behavior (which eventually calls JwtStrategy.validate())
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    
    return user;
  }
}
