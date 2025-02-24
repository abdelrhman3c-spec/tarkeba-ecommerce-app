import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';


@Injectable()
export class RedisClientService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    async onModuleInit() {
        this.client = createClient({ url: process.env.REDIS_URL });
        this.client.on('error', (err) => console.error('Redis Client Error', err));
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    async set(key: string, value: string, ttl?: number) {
        await this.client.set(key, value);
        if (ttl) await this.client.expire(key, ttl);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async increase(key: string): Promise<number> {
        return this.client.incr(key);
    }

    async decrease(key: string): Promise<number> {
        return this.client.decr(key);
    }

    async expire(key: string, ttl: number): Promise<void> {
        await this.client.expire(key, ttl);
    }

}
