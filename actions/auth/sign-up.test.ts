import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUpAction } from "@/actions/auth/sign-up";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        verificationToken: {
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

// vi.mock("bcryptjs", () => ({
//     default: { hash: vi.fn().mockResolvedValue("hashed_password") },
// }));

// vi.mock("crypto", () => ({
//     randomBytes: vi.fn().mockReturnValue(Buffer.from("mocked_token_hex")),
// }));

vi.mock("@/lib/sendEmail", () => ({
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next-intl/server", () => ({
    getLocale: vi.fn().mockResolvedValue("en"),
    getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

function makeFormData(data: Record<string, string>) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    return fd;
}

const validFormData = makeFormData({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
});

const prevState = {
    success: false,
    message: "",
    email: "",
    error: {},
}

describe("signUpAction", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('ควรคืนค่า invalidInput เมื่อส่งข้อมูลไม่ถูกต้อง', async () => {
        const invalidFormData = makeFormData({
            name: "",
            email: "invalid-email",
            password: "short",
            confirmPassword: "short",
        })

        const result = await signUpAction(prevState, invalidFormData)

        expect(result.success).toBe(false)
        expect(result.message).toBe("invalidInput")
        expect(result.error).not.toBeNull()
    })

    it('ควรลบข้อมูลเก่าถ้ามี email ซ้ำและยังไม่ยืนยัน', async () => {
        const findUniqueMock = vi.mocked(prisma.user.findUnique)

        findUniqueMock.mockResolvedValue({
            id: "",
            name: "Test User",
            email: "test@example.com",
            password: "hashed_password",
            emailVerified: null,
            image: null,
            role: "USER",
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            stripeStatus: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            plan: "FREE",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const result = await signUpAction(prevState, validFormData)

        expect(result.success).toBe(true)
        expect(result.message).toBe("userCreated")
    })

    it('ควรคืนค่า emailExists เมื่อส่ง email ที่มีอยู่แล้ว', async () => {
        const findUniqueMock = vi.mocked(prisma.user.findUnique)

        findUniqueMock.mockResolvedValue({
            id: "",
            name: "Test User",
            email: "test@example.com",
            password: "hashed_password",
            emailVerified: new Date("2026-05-17 02:26:45.156"),
            image: null,
            role: "USER",
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            stripeStatus: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            plan: "FREE",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const result = await signUpAction(prevState, validFormData)

        expect(result.success).toBe(false)
        expect(result.message).toBe("emailExists")
    })

    it('ควรคืนค่า userCreated เมื่อสร้าง user สำเร็จ', async () => {
        const findUniqueMock = vi.mocked(prisma.user.findUnique)
        const createMock = vi.mocked(prisma.user.create)

        findUniqueMock.mockResolvedValue(null)

        createMock.mockResolvedValue({
            id: "",
            name: "Test User",
            email: "test@example.com",
            password: "hashed_password",
            emailVerified: null,
            image: null,
            role: "USER",
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            stripeStatus: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            plan: "FREE",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const result = await signUpAction(prevState, validFormData)

        expect(result.success).toBe(true)
        expect(result.message).toBe("userCreated")
    })

    it('ควรคืนค่า signUpError เมื่อเกิดข้อผิดพลาดในการสร้าง user', async () => {
        const findUniqueMock = vi.mocked(prisma.user.findUnique)
        const createMock = vi.mocked(prisma.user.create)

        findUniqueMock.mockResolvedValue(null)

        createMock.mockRejectedValue(new Error("Failed to create user"))

        const result = await signUpAction(prevState, validFormData)

        expect(result.success).toBe(false)
        expect(result.message).toBe("signUpError")
    })
})



