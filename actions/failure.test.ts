/**
 * Integration Test สำหรับ Server Action ในไฟล์ failure.ts
 * ครอบคลุมการทำงาน: Create, Update และ Delete
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { createFailure, updateFailure, deleteFailure } from './failure';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

describe('createFailure Action', () => {
    /**
     * ส่วนเตรียมข้อมูลจำลอง (Mocking)
     */
    const mockUser = {
        id: 'test-user-uuid',
        email: 'test@example.com'
    };

    /**
     * beforeEach: รันก่อนเริ่ม "แต่ละ" Test case
     * ใช้สำหรับเตรียมข้อมูล (Setup) และล้างฐานข้อมูล (Cleanup) เพื่อให้ผลลัพธ์เป็นอิสระต่อกัน
     */
    beforeEach(async () => {
        // 1. ล้างสถานะ Mock: เพื่อไม่ให้ค่าจากเทสก่อนหน้าหลงเหลือมา
        vi.resetAllMocks();

        // 2. Cleanup: ลบข้อมูลในตารางที่เกี่ยวข้องทิ้งให้หมด (Fresh Start)
        await prisma.failure.deleteMany();
        await prisma.user.deleteMany();

        // 3. Setup: สร้าง User รอไว้ใน DB (เนื่องจาก Failure ต้องมีเจ้าของ / Foreign Key)
        await prisma.user.create({
            data: {
                id: mockUser.id,
                email: mockUser.email,
                name: 'Test User'
            }
        });
    });

    it('ควรสร้าง Failure สำเร็จเมื่อกรอกข้อมูลครบ (รวม Category ID จาก Seed)', async () => {
        /**
         * [Arrange] - เตรียมสถานะ: จำลองว่า Login แล้ว และตระเตรียมข้อมูลที่จะส่งเข้า Action
         */
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        // ดึงข้อมูล Category และ Emotion จริงๆ จากที่ Seed ไว้ เพื่อให้ ID ตรงกับที่มีใน DB
        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });

        if (!category || !emotion) {
            throw new Error("❌ ไม่พบ Category หรือ Emotion ใน Database! กรุณารัน npm run test:db:setup");
        }

        // จำลอง FormData เหมือนที่ส่งมาจาก Browser
        const formData = new FormData();
        formData.append('title', 'Test Failure');
        formData.append('description', 'This is a test');
        formData.append('categoryId', category.id.toString());
        formData.append('emotions', emotion.id.toString());

        /**
         * [Act] - เรียกใช้ Server Action (เสมือนการกด Submit Form)
         */
        const result = await createFailure({ success: false, message: '' }, formData);

        /**
         * [Assert] - ตรวจสอบผลลัพธ์
         */
        // 1. ตรวจสอบว่า Action คืนค่า Success กลับมาไหม
        expect(result.success).toBe(true);

        // 2. ตรวจสอบใน Database จริงๆ (Integration Check) ว่าข้อมูลถูกบันทึกจริงหรือไม่
        const failure = await prisma.failure.findFirst({ where: { title: 'Test Failure' } });
        expect(failure).toBeDefined();
        expect(failure?.categoryId).toBe(category.id);
    });

    it('ควรล้มเหลวหากผู้ใช้ยังไม่ได้ Login', async () => {
        // [Arrange] - จำลองว่ายังไม่ได้ Login (Session เป็น null)
        (getSession as Mock).mockResolvedValue(null);

        // [Act]
        const result = await createFailure({ success: false, message: '' }, new FormData());

        // [Assert] - ต้องคืนสถานะ Error พร้อม Message ว่า unauthorized
        expect(result.success).toBe(false);
        expect(result.message).toBe('unauthorized');
    });
});

describe('updateFailure Action', () => {
    const mockUser = { id: 'test-user-id', email: 'user@test.com', role: 'USER' };
    const otherUser = { id: 'other-user-id', email: 'other@test.com', role: 'USER' };

    beforeEach(async () => {
        vi.resetAllMocks();
        await prisma.failure.deleteMany();
        await prisma.user.deleteMany();

        // สร้างผู้ใช้ 2 คน: เจ้าของตัวจริง (mockUser) และคนแปลกหน้า (otherUser)
        await prisma.user.createMany({
            data: [
                { id: mockUser.id, email: mockUser.email, name: 'Main User', role: 'USER' },
                { id: otherUser.id, email: otherUser.email, name: 'Other User', role: 'USER' }
            ]
        });
    });

    it('ควรแก้ไข Failure สำเร็จหากเป็นเจ้าของข้อมูล (รวมถึงการแก้ Emotions)', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const availableEmotions = await prisma.emotion.findMany({ take: 2 });

        if (!category || availableEmotions.length < 2) {
            throw new Error("❌ ข้อมูล Seed ไม่พอสำหรับการเทส!");
        }

        // 1. สร้าง Record ตั้งต้นที่มีอารมณ์แบบที่ 1
        const failure = await prisma.failure.create({
            data: {
                title: 'Old Title',
                description: 'Old Desc',
                categoryId: category.id,
                userId: mockUser.id,
                emotions: { connect: [{ id: availableEmotions[0].id }] }
            }
        });

        // 2. เตรียมข้อมูลอัปเดต (เปลี่ยน Title และเปลี่ยนเป็นอารมณ์แบบที่ 2)
        const formData = new FormData();
        formData.append('id', failure.id.toString());
        formData.append('title', 'New Title');
        formData.append('description', 'New Desc');
        formData.append('categoryId', category.id.toString());
        formData.append('emotions', availableEmotions[1].id.toString());

        // [Act]
        const result = await updateFailure({ success: false, message: '' }, formData);

        // [Assert]
        expect(result.success).toBe(true);
        const updated = await prisma.failure.findUnique({
            where: { id: failure.id },
            include: { emotions: true }
        });

        expect(updated?.title).toBe('New Title');
        // ตรวจสอบว่าอารมณ์ถูกสลับเป็นอันใหม่เรียบร้อย
        expect(updated?.emotions.some(e => e.id === availableEmotions[1].id)).toBe(true);
        expect(updated?.emotions.length).toBe(1);
    });

    it('ควรล้มเหลวหากพยายามแก้ไขข้อมูลของคนอื่น (Forbidden)', async () => {
        // [Arrange] - Login เป็น otherUser แต่พยายามจะมาแก้ของ mockUser
        (getSession as Mock).mockResolvedValue({ user: { id: otherUser.id } });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        if (!category) throw new Error("Seed data missing");

        const failure = await prisma.failure.create({
            data: { title: 'Owner Title', description: 'Desc', categoryId: category.id, userId: mockUser.id }
        });

        const formData = new FormData();
        formData.append('id', failure.id.toString());
        formData.append('title', 'Hacked Title');
        formData.append('description', 'Hacked Desc');
        formData.append('categoryId', category.id.toString());

        // [Act]
        const result = await updateFailure({ success: false, message: '' }, formData);

        // [Assert] - ระบบต้องบล็อกห้ามแก้ไข (forbidden)
        expect(result.success).toBe(false);
        expect(result.message).toBe('forbidden');
    });

    it('ควรแก้ไขสำเร็จหากเป็น Admin (แม้ไม่ใช่เจ้าของ)', async () => {
        // [Arrange] - Login ด้วยสิทธิ์ ADMIN
        const adminId = 'admin-id';
        await prisma.user.create({
            data: { id: adminId, email: 'admin@test.com', name: 'Admin', role: 'ADMIN' }
        });
        (getSession as Mock).mockResolvedValue({ user: { id: adminId, role: 'ADMIN' } });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing");

        // สร้างข้อมูลที่เป็นของ User ธรรมดา
        const failure = await prisma.failure.create({
            data: {
                title: 'User Title',
                description: 'Desc',
                categoryId: category.id,
                userId: mockUser.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const formData = new FormData();
        formData.append('id', failure.id.toString()); // สำคัญ: ต้องระบุ ID ที่จะแก้
        formData.append('title', 'Admin Overwrite');
        formData.append('description', 'Admin Desc');
        formData.append('categoryId', category.id.toString());
        formData.append('emotions', emotion.id.toString());

        // [Act]
        const result = await updateFailure({ success: false, message: '' }, formData);

        // [Assert] - ต้องแก้ได้สำเร็จเพราะสิทธิ์สูงสุด
        expect(result.success).toBe(true);
        const updated = await prisma.failure.findUnique({ where: { id: failure.id } });
        expect(updated?.title).toBe('Admin Overwrite');
    });
});

describe('deleteFailure Action', () => {
    const mockUser = { id: 'test-user-id', email: 'user@test.com' };

    beforeEach(async () => {
        vi.resetAllMocks();
        await prisma.failure.deleteMany();
        await prisma.user.deleteMany();
        await prisma.user.create({ data: { id: mockUser.id, email: mockUser.email } });
    });

    it('ควรลบ Failure สำเร็จหากเป็นเจ้าของ', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });
        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        if (!category) throw new Error("Seed data missing");

        const failure = await prisma.failure.create({
            data: { title: 'To be deleted', description: 'Desc', categoryId: category.id, userId: mockUser.id }
        });

        // [Act]
        const result = await deleteFailure(failure.id);

        // [Assert]
        expect(result.success).toBe(true);
        const deleted = await prisma.failure.findUnique({ where: { id: failure.id } });
        expect(deleted).toBeNull();
    });

    it('ควรล้มเหลวหากคนอื่นพยายามมาลบ (Forbidden)', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: 'other-id' } });
        await prisma.user.create({
            data: { id: 'other-id', email: 'other@test.com' }
        });
        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        if (!category) throw new Error("Seed data missing");

        const failure = await prisma.failure.create({
            data: { title: 'Safe Title', description: 'Desc', categoryId: category.id, userId: mockUser.id }
        });

        // [Act]
        const result = await deleteFailure(failure.id);

        // [Assert]
        expect(result.success).toBe(false);
        expect(result.message).toBe('forbidden');
    });

    it('ควรลบได้สำเร็จหากเป็น Admin', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: 'admin-id', role: 'ADMIN' } });
        await prisma.user.create({
            data: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' }
        });
        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        if (!category) throw new Error("Seed data missing");

        const failure = await prisma.failure.create({
            data: { title: 'Admin will delete', description: 'Desc', categoryId: category.id, userId: mockUser.id }
        });

        // [Act]
        const result = await deleteFailure(failure.id);

        // [Assert]
        expect(result.success).toBe(true);
        const deleted = await prisma.failure.findUnique({ where: { id: failure.id } });
        expect(deleted).toBeNull();
    });

    it('ควรล้มเหลวหากพยายามลบข้อมูลที่ไม่มีอยู่จริง', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        // [Act]
        const result = await deleteFailure(9999);

        // [Assert]
        expect(result.success).toBe(false);
        expect(result.message).toBe('failureNotFound');
    });
});

