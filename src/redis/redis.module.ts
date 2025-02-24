import { Module } from '@nestjs/common';
import { RedisClientService,  } from './redis.client.service';
import { BlacklistService } from './blacklist.service';
import { AccountLockService } from './account-lock.service';

@Module({
    providers: [RedisClientService, BlacklistService, AccountLockService],
    exports: [BlacklistService, AccountLockService],
})
export class RedisModule {}
