import { Redis } from "ioredis";
import { REDIS_URL } from "./constants";

export class RedisService {
    private static _instance: RedisService | null = null;
    private _redis: Redis;

    constructor() {
        this._redis = new Redis(REDIS_URL);
    }

    public static getInstance(): Redis {
        if (!RedisService._instance) {
            RedisService._instance = new RedisService();
        }

        return RedisService._instance._redis;
    }
}

export const redis = RedisService.getInstance();