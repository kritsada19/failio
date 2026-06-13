import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { sendNotificationSubscript } from "@/lib/notificationSubscription"
import Stripe from "stripe"

/**
 * --- ส่วนการจำลอง (Mocks) ---
 * เราต้อง Mock โมดูลต่างๆ เพื่อไม่ให้มีการเรียกใช้งาน API จริง หรือเชื่อมต่อ Database จริงในช่วง Unit Test
 */


// 1. Mock ระบบ Rate Limit (จำลองว่าผ่านฉลุยเสมอ ยกเว้นเราจะจงใจให้ไม่ผ่าน)
vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn(),
}))

// 2. Mock ฟังก์ชันส่งอีเมลแจ้งเตือน
vi.mock("@/lib/notificationSubscription", () => ({
    sendNotificationSubscript: vi.fn(),
}))

// 3. Mock Prisma เพื่อจำลองการเข้าถึงฐานข้อมูลในระดับโปรแกรม
vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            update: vi.fn(),
            findUnique: vi.fn(),
        },
    },
}))

/**
 * --- ส่วนพิเศษสำหรับ Stripe ---
 */

// ใช้ vi.hoisted เพื่อเลื่อนการสร้าง Mock ฟังก์ชันขึ้นไปก่อนที่ vi.mock("stripe") จะถูกเรียก
const { mockConstructEvent, mockRetrieveSubscription } = vi.hoisted(() => ({
    mockConstructEvent: vi.fn(),
    mockRetrieveSubscription: vi.fn(),
}))

// จำลองคลาส Stripe ให้สามารถใช้งาน 'new Stripe()' ในโค้ดหลักได้
vi.mock("stripe", () => {
    const StripeMock = vi.fn().mockImplementation(function () {
        return {
            webhooks: {
                constructEvent: mockConstructEvent,
            },
            subscriptions: {
                retrieve: mockRetrieveSubscription,
            },
        }
    })
    return {
        default: StripeMock,
        Stripe: StripeMock,
    }
})

/**
 * --- ตัวช่วย (Helpers) ---
 */

// ฟังก์ชันจำลอง Request ที่ส่งมาจาก Stripe
function makeRequest(body = "raw-body", signature = "valid-sig") {
    return {
        text: vi.fn().mockResolvedValue(body),
        headers: { get: (key: string) => (key === "stripe-signature" ? signature : null) },
    } as unknown as NextRequest
}

const mockRateLimit = rateLimit as ReturnType<typeof vi.fn>
const mockPrismaUpdate = prisma.user.update as ReturnType<typeof vi.fn>
const mockPrismaFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>

// ล้างค่าสถานะ Mock ทุกครั้งก่อนเริ่ม Test Case ใหม่
beforeEach(() => {
    vi.resetAllMocks()
    mockRateLimit.mockResolvedValue({ success: true })
    mockPrismaFindUnique.mockResolvedValue({ email: "user@test.com" })
    mockPrismaUpdate.mockResolvedValue({})
})

/**
 * --- การทดสอบ (Tests) ---
 */
describe("POST /api/webhook/stripe", () => {

    // ทดสอบ Rate Limit
    it("ควรคืนค่า 429 เมื่อมีการเรียกใช้งานบ่อยเกินไป (Rate Limited)", async () => {
        mockRateLimit.mockResolvedValue({ success: false })
        const res = await POST(makeRequest())
        expect(res.status).toBe(429)
    })

    // ทดสอบการป้องกันข้อมูลปลอม (Invalid Signature)
    it("ควรคืนค่า 400 เมื่อลายเซ็น Webhook ไม่ถูกต้อง", async () => {
        mockConstructEvent.mockImplementation(() => {
            throw new Error("Invalid signature")
        })
        const res = await POST(makeRequest())
        expect(res.status).toBe(400)
    })

    // ทดสอบกรณีจ่ายเงินสำเร็จครั้งแรก (Subscription Started)
    describe("checkout.session.completed", () => {
        const mockSubscription = {
            id: "sub_123",
            status: "active",
            items: { data: [{ price: { id: "price_123" } }] },
            current_period_end: 9999999999,
        }

        beforeEach(() => {
            mockConstructEvent.mockReturnValue({
                type: "checkout.session.completed",
                data: {
                    object: {
                        subscription: "sub_123",
                        customer: "cus_123",
                        metadata: { userId: "user_abc", locale: "th" },
                    },
                },
            })
            mockRetrieveSubscription.mockResolvedValue(mockSubscription)
        })

        it("ควรอัปเกรด User เป็นแผน PRO", async () => {
            const res = await POST(makeRequest())
            expect(res.status).toBe(200)
            expect(mockPrismaUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "user_abc" },
                    data: expect.objectContaining({ plan: "PRO" }),
                })
            )
        })

        it("ควรส่งอีเมลแจ้งเตือนด้วยภาษาที่ถูกต้อง (Locale)", async () => {
            await POST(makeRequest())
            expect(sendNotificationSubscript).toHaveBeenCalledWith("user@test.com", "th")
        })
    })

    // ทดสอบกรณีต่ออายุสมาชิกสำเร็จ (Recurring Payment)
    describe("invoice.payment_succeeded", () => {
        it("ควรอัปเดตข้อมูล Subscription ในฐานข้อมูล", async () => {
            mockConstructEvent.mockReturnValue({
                type: "invoice.payment_succeeded",
                data: { object: { subscription: "sub_123" } },
            })
            mockRetrieveSubscription.mockResolvedValue({
                id: "sub_123",
                status: "active",
                items: { data: [{ price: { id: "price_123" } }] },
                current_period_end: 9999999999,
                metadata: { locale: "en" },
            })
            const res = await POST(makeRequest())
            expect(res.status).toBe(200)
            expect(mockPrismaUpdate).toHaveBeenCalled()
        })
    })

    // ทดสอบกรณียกเลิกสมาชิก (Subscription Deleted)
    it("ควรปรับแผนเป็น FREE เมื่อยกเลิกสมาชิก", async () => {
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.deleted",
            data: { object: { id: "sub_123" } },
        })
        const res = await POST(makeRequest())
        expect(mockPrismaUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ plan: "FREE", stripeStatus: "canceled" }),
            })
        )
        expect(res.status).toBe(200)
    })

    // ทดสอบการเปลี่ยนสถานะต่างๆ ของ Subscription
    it.each([
        ["active", "PRO"],
        ["trialing", "PRO"],
        ["past_due", "PRO"],
        ["canceled", "FREE"],
        ["unpaid", "FREE"],
    ])("ควรปรับแผนเป็น %s เมื่อสถานะ Stripe คือ %s", async (status, expectedPlan) => {
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: { object: { id: "sub_123", status, current_period_end: 9999999999 } },
        })
        await POST(makeRequest())
        expect(mockPrismaUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ plan: expectedPlan }),
            })
        )
    })

    // ทดสอบกรณี Database พัง (Error 500)
    it("ควรคืนค่า 500 เมื่อ Prisma ทำงานผิดพลาด", async () => {
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.deleted",
            data: { object: { id: "sub_123" } },
        })
        mockPrismaUpdate.mockRejectedValue(new Error("DB down"))
        const res = await POST(makeRequest())
        expect(res.status).toBe(500)
    })
})
