import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { Stripe } from "stripe";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { stripe } from "./route";

// ใช้ vi.hoisted เพื่อให้ตัวแปร mock ถูก hoisted ไปพร้อมกับ vi.mock
// const { mockCheckoutCreate, mockRateLimit, mockGetLocale } = vi.hoisted(() => ({
//     mockCheckoutCreate: vi.fn(),
//     mockRateLimit: vi.fn(),
//     mockGetLocale: vi.fn(),
// }));

vi.mock("stripe", () => ({
    default: class {
        checkout = {
            sessions: {
                create: vi.fn(),
            },
        };
    },
}));

vi.mock("next-auth", () => ({
    default: vi.fn(),
    getServerSession: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
    getLocale: vi.fn().mockResolvedValue("en"),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn(),
}));

vi.mock("@/lib/getClientIp", () => ({
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));



import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { rateLimit } from "@/lib/rate-limit";

describe('POST /api/checkout', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(getLocale).mockResolvedValue("en");
        vi.mocked(rateLimit).mockResolvedValue({ success: true, current: 1, limit: 5, remaining: 4 });
    });

    it('ควรคืนค่า 200 และ checkout URL สำหรับผู้ใช้ที่ล็อกอิน', async () => {
        const mockUserSession = {
            user: {
                id: 'user-test-id',
                email: 'test@failio.com',
                plan: 'PRO' as const,
                stripeCustomerId: 'cus_test',
            },
        };

        const mockGetServerSession = vi.mocked(getServerSession);
        const mockCheckoutCreate = vi.mocked(stripe.checkout.sessions.create);

        mockGetServerSession.mockResolvedValue(mockUserSession);


        (prisma.user.findUnique as Mock).mockResolvedValue({
            stripeCustomerId: 'cus_test',
            email: 'test@failio.com',
        });

        mockCheckoutCreate.mockResolvedValue({
            url: 'https://checkout.stripe.com/c/checkout/test_session_id',
        } as Stripe.Response<Stripe.Checkout.Session>);

        const req = new NextRequest('http://localhost/api/checkout', {
            method: 'POST',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.url).toBe('https://checkout.stripe.com/c/checkout/test_session_id');
        expect(mockCheckoutCreate).toHaveBeenCalledWith(expect.objectContaining({
            customer: 'cus_test',
            mode: 'subscription',
        }));
    });

    it('ควรคืนค่า 401 เมื่อผู้ใช้ไม่ได้ล็อกอิน', async () => {
        const mockGetServerSession = vi.mocked(getServerSession);
        mockGetServerSession.mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/checkout', {
            method: 'POST',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('ควรคืนค่า 429 เมื่อติด rate limit', async () => {
        vi.mocked(rateLimit).mockResolvedValue({ success: false, current: 6, limit: 5, remaining: 0 });

        const req = new NextRequest('http://localhost/api/checkout', {
            method: 'POST',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.message).toBe('Too many requests');
    });
});