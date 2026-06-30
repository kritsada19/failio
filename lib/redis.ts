import IORedis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

// Lazy initialization — avoids crashing at Next.js build time when env vars
// are not available (e.g. in CI build steps without real Redis credentials).
let _redis: IORedis | UpstashRedis | null = null;

function getRedis(): IORedis | UpstashRedis {
    if (_redis) return _redis;

    if (process.env.NODE_ENV === "production") {
        _redis = new UpstashRedis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    } else {
        _redis = new IORedis({
            host: "localhost",
            port: 6379,
            maxRetriesPerRequest: null,
        });
    }

    return _redis;
}

// Proxy object — looks and works exactly like the redis instance,
// but the real connection is only created on first actual use.
export const redis = new Proxy({} as IORedis & UpstashRedis, {
    get(_target, prop) {
        const instance = getRedis();
        const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});