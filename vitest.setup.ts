// vitest.setup.ts
// ไฟล์นี้เปรียบเสมือนจุดเตรียมการ (Preparation) ก่อนที่เคสทดสอบต่างๆ จะเริ่มรัน
import { vi } from 'vitest';
import path from 'path';
import { config } from 'dotenv';

// 1. แยกระหว่าง Database จริง กับ Database สำหรับเทส
// โหลดค่าจาก .env.test เพื่อให้ตัวแปรอย่าง DATABASE_URL ชี้ไปยัง DB ก้อนแยก
// วิธีนี้ช่วยป้องกันไม่ให้ข้อมูลใน Development/Production หายตอนรันเทส (สำคัญมาก!)
config({ path: path.resolve(__dirname, '.env.test') });

// 2. Mock next-intl (ระบบจัดแสดงผลหลายภาษา)
// ใน Server Actions มีการใช้ getTranslations() เพื่อดึง Error Message
// เรา Mock ให้มันคืนค่า Key กลับมาตรงๆ เพื่อให้ Assertion ในเทสตรวจสอบได้ง่ายขึ้น
vi.mock('next-intl/server', () => ({
    getTranslations: () => Promise.resolve((key: string) => key),
}));

// 3. Mock Auth (ระบบสมาชิกและการเข้าสู่ระบบ)
// เรา Mock getSession เพื่อให้ในแต่ละ Test Case สามารถกำหนดได้เองว่า
// "เคสนี้จำลองว่าเป็น User ID นี้" หรือ "เคสนี้จำลองว่ายังไม่ได้ Login (getSession -> null)"
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

// 4. Mock Redis
// สำหรับ Integration Test เราเน้นที่ Prisma/PostgreSQL เป็นหลัก
// การ Mock Redis ช่วยให้ไม่ต้องเปิด Service Redis ทิ้งไว้ตอนรันเทส
// และช่วยให้เราใช้ vi.fn() มาตรวจสอบได้ว่าโค้ดมีการเรียกใช้ Cache จริงหรือไม่
vi.mock('@/lib/redis', () => ({
    redis: {
        incr: vi.fn().mockResolvedValue(1),
        decr: vi.fn().mockResolvedValue(0),
        expire: vi.fn().mockResolvedValue(1),
        del: vi.fn().mockResolvedValue(1),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue('OK'),
    },
}));

vi.mock('@/lib/ai-analysis/queue', () => ({
    aiQueue: {
        add: vi.fn(),
    },
}));
