import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "./rate-limit";
import { NextRequest } from "next/server";
import { redis } from "./redis"
import { getClientIp } from "./getClientIp";

vi.mock("./redis", () => ({
    redis: {
        incr: vi.fn(),
        expire: vi.fn(),
    },
}));

vi.mock("@/lib/getClientIp", () => ({
    getClientIp: vi.fn().mockReturnValue("test"),
}));

function makeNextRequest(url: string) {
    return {
        nextUrl: {
            pathname: url,
        },
    } as NextRequest;
}

describe("rateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("ควรคืนค่า success = true เมื่อ current <= limit", async () => {
        const redisMock = vi.mocked(redis);

        redisMock.incr.mockResolvedValue(1);
        redisMock.expire.mockResolvedValue(1);

        const request = makeNextRequest("/api/test");
        const ip = getClientIp(request);
        const result = await rateLimit(ip, 10, 60, request);

        expect(result.success).toBe(true);
        expect(result.current).toBe(1);
        expect(result.remaining).toBe(9);
    });

    it("ควรคืนค่า success = false เมื่อ current > limit", async () => {
        const redisMock = vi.mocked(redis);

        redisMock.incr.mockResolvedValue(11);
        redisMock.expire.mockResolvedValue(1);

        const request = makeNextRequest("/api/test");
        const ip = getClientIp(request);
        const result = await rateLimit(ip, 10, 60, request);

        expect(result.success).toBe(false);
        expect(result.current).toBe(11);
        expect(result.remaining).toBe(0);
    });
});