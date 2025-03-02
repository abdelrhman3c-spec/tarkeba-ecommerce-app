import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token/token.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    TokenService,
    JwtAccessStrategy, 
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [TokenService],
})
export class AuthModule {}
