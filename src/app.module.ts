import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { OrdersController } from './orders/orders.controller';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRoot(process.env.MONGO_URI),
    RedisModule,
    AuthModule, 
    UsersModule, 
    MailModule, 
    AdminModule,
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService, AdminService],
})

export class AppModule {}
