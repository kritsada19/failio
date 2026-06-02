import { GET } from './route';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redis } from '@/lib/redis';

/**
 * API Route Test for GET /api/failure/[id]
 * ครอบคลุมเรื่อง: Redis Caching, DB Fallback, User Plan, และ AI Usage
 */
describe('Failure API Route (GET /api/failure/[id])', () => {
    // ข้อมูลจำลองสำหรับ User ที่จะถูกสร้างในทุกเทสเคส
    const mockUser = {
        id: 'user-test-id',
        email: 'tester@failio.com',
        plan: 'PRO' as const
    };

    /**
     * beforeEach: ทำความสะอาดสภาพแวดล้อมก่อนเริ่มแต่ละเคส
     */
    beforeEach(async () => {
        // ล้างสถานะ Mock และ Implementation ที่เราเคยเขียนไว้ในเทสก่อนหน้า
        vi.resetAllMocks();

        // ล้างข้อมูลเก่าในฐานข้อมูล (Integration Test ต้องเริ่มจากความว่างเปล่าเสมอ)
        await prisma.failure.deleteMany();
        await prisma.user.deleteMany();

        // สร้าง User จำลองรอไว้เพื่อให้ foreign key ในการสร้าง Failure ทำงานได้
        await prisma.user.create({
            data: {
                id: mockUser.id,
                email: mockUser.email,
                plan: mockUser.plan,
            }
        });
    });

    it('ควรดึงข้อมูลจาก Redis ได้ทันทีหากมีข้อมูลใน Cache (Cache Hit)', async () => {
        // [Arrange] - เตรียมสถานะ: จำลองว่า Login แล้ว และมีข้อมูล "รอ" อยู่ใน Redis
        (getSession as any).mockResolvedValue({ user: { id: mockUser.id } });

        const mockCachedFailure = {
            title: 'I am from Redis',
            description: 'This data was cached',
            userId: mockUser.id
        };

        const targetId = '123';
        // จำลองพฤติกรรม Redis: ถ้าเรียก key นี้ ให้คืนค่า JSON ที่เรากำหนด
        (redis.get as any).mockImplementation((key: string) => {
            if (key === `failure:${targetId}`) return Promise.resolve(JSON.stringify(mockCachedFailure));
            if (key.startsWith('ai_usage:')) return Promise.resolve('5'); // AI Usage = 5
            return Promise.resolve(null);
        });

        const req = new NextRequest(`http://localhost/api/failure/${targetId}`);
        const params = Promise.resolve({ id: targetId });

        // [Act] - เรียกใช้ฟังก์ชัน API
        const res = await GET(req, { params });
        const data = await res.json();

        // [Assert] - ตรวจสอบความถูกต้อง
        expect(res.status).toBe(200);
        expect(data.title).toBe('I am from Redis'); // ต้องได้ค่าตามที่เรา Mock ไว้ใน Redis
        expect(data.userPlan).toBe('PRO');
        expect(data.aiUsage).toBe(5);

        // ตรวจสอบหลักฐานว่าโค้ดมีการเรียกใช้ Redis จริงๆ ไม่ได้ข้ามไป DB
        expect(redis.get).toHaveBeenCalledWith(`failure:${targetId}`);
    });

    it('ควรดึงจาก DB และบันทึกลง Redis หากไม่มีข้อมูลใน Cache (Cache Miss)', async () => {
        // [Arrange] - เตรียมสถานะ: จำลองว่า Redis ไม่มีข้อมูล (คืนค่า null)
        (getSession as any).mockResolvedValue({ user: { id: mockUser.id } });
        (redis.get as any).mockResolvedValue(null);

        // ดึง Category และ Emotion จาก Seed (ใช้ชื่อที่เรารู้ว่ามีอยู่แล้ว)
        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        // สร้างข้อมูล "จริงๆ" ลงใน Database ก้อนทดสอบ
        const dbFailure = await prisma.failure.create({
            data: {
                title: 'I am from Database',
                description: 'Fresh from DB',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${dbFailure.id}`);
        const params = Promise.resolve({ id: dbFailure.id.toString() });

        // [Act] - เรียกใช้ฟังก์ชัน API
        const res = await GET(req, { params });
        const data = await res.json();

        // [Assert] - ตรวจสอบความถูกต้อง
        expect(res.status).toBe(200);
        expect(data.title).toBe('I am from Database');

        // **จุดสำคัญ**: เมื่อเกิด Cache Miss โค้ดควรจะสั่ง Redis.set เพื่อเก็บข้อมูลเข้า Cache ในครั้งหน้า
        expect(redis.set).toHaveBeenCalledWith(
            `failure:${dbFailure.id}`,
            expect.stringContaining('I am from Database'),
            'EX',
            expect.any(Number)
        );
    });

    it('ควรคืนค่า 401 หากผู้ใช้ยังไม่ได้ Login', async () => {
        // [Arrange] - จำลองว่ายังไม่ได้ Login
        (getSession as any).mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/failure/1');
        const params = Promise.resolve({ id: '1' });

        // [Act]
        const res = await GET(req, { params });

        // [Assert]
        expect(res.status).toBe(401);
    });

    it('ควรคืนค่า 404 หากไม่พบข้อมูลทั้งใน Cache และ DB', async () => {
        // [Arrange]
        (getSession as any).mockResolvedValue({ user: { id: mockUser.id } });
        (redis.get as any).mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/failure/999');
        const params = Promise.resolve({ id: '999' });

        // [Act]
        const res = await GET(req, { params });

        // [Assert]
        expect(res.status).toBe(404);
    });
});
