import IORedis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

let redis: IORedis | UpstashRedis;

if (process.env.NODE_ENV === "production") {
    redis = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
} else {
    redis = new IORedis({
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null,
    });
}

export { redis };