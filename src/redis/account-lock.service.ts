import { Injectable } from '@nestjs/common';
import { RedisClientService } from './redis.client.service';

@Injectable()
export class AccountLockService {
    constructor(private readonly redisClient: RedisClientService) {}

    async incrementFailedAttempts(email: string): Promise<number> {
        const key = `failedAttempts:${email}`;
        const attempts = await this.redisClient.increase(key);
        if (attempts === 1) {
            const resetTimeout = 15 * 60; // 15 minutes
            await this.redisClient.expire(key, resetTimeout);
        }
        return attempts;
    }

    async getFailedAttempts(email: string) {
        return parseInt((await this.redisClient.get(`failedAttempts:${email}`)) || '0');
    }
    
    async resetFailedAttempts(email: string) {
        await this.redisClient.delete(`failedAttempts:${email}`);
    }

    async lockAccount(email: string): Promise<void> {
        const lockDuration = 15 * 60; // 15 minutes
        await this.redisClient.set(`locked:${email}`, '1', lockDuration);
    }

    async isAccountLocked(email: string): Promise<boolean> {
        return (await this.redisClient.get(`locked:${email}`)) !== null;
    }
}
