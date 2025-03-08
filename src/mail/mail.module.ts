import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailQueueProcessor } from './mail.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email-queue',
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    service: configService.get<string>('MAIL_SERVICE_PROVIDER'),
                    auth: {
                        user: configService.get<string>('MAIL_USER'),
                        pass: configService.get<string>('MAIL_PASS'),
                    },
                    debug: true
                },
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
    ],
    providers: [MailService, MailQueueProcessor],
    exports: [MailService],
})
export class MailModule {}
