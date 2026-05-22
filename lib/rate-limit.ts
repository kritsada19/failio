import { redis } from "./redis";
import { NextRequest } from "next/server";

export async function rateLimit(identifier: string, limit: number = 100, windowInSeconds: number = 60, request: NextRequest) {
    try {
        const path = request.nextUrl.pathname;
        const key = `rate-limit:${identifier}:${path}`;

        const current = await redis.incr(key);

        if (current === 1) {
            await redis.expire(key, windowInSeconds);
        }

        return {
            current,
            limit,
            remaining: Math.max(0, limit - current),
            success: current <= limit,
        }
    } catch (error) {
        console.error("Error rate limit: ", error);
        return {
            current: 0,
            limit,
            remaining: limit,
            success: true,
        }
    }
}