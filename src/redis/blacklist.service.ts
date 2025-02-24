import { Injectable } from '@nestjs/common';
import { RedisClientService } from './redis.client.service';

@Injectable()
export class BlacklistService {
    constructor(private readonly redisClient: RedisClientService) {}

    async blacklistToken(token: string, expiresIn: number): Promise<void> {
        await this.redisClient.set(`blacklist:${token}`, '1', expiresIn);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return (await this.redisClient.get(`blacklist:${token}`)) !== null;
    }
}
