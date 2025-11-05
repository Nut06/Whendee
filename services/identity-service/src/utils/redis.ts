import { createClient, RedisClientType } from 'redis';
import {promisify} from 'util';

export const redisClient: RedisClientType = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD
});

export const setAsync = promisify(redisClient.set).bind(redisClient);
export const getAsync = promisify(redisClient.get).bind(redisClient);
export const delAsync = promisify(redisClient.del).bind(redisClient);
