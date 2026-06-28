import { PUT } from "./route";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { aiQueue } from "@/lib/ai-analysis/queue";
import { redis } from "@/lib/redis";
import type { Mock } from 'vitest';

describe('PUT /api/failure/[id]/analyze', () => {

    const mockUser = {
        id: 'user-test-id',
        email: 'tester@failio.com',
        plan: 'PRO' as const
    };

    const otherUser = {
        id: 'other-user-id',
        email: 'other@failio.com',
        plan: 'PRO' as const
    };

    beforeEach(async () => {
        vi.resetAllMocks();

        // [New Fix] ตั้งค่า Default Mock สำหรับ Redis หลังจาก reset
        (redis.incr as Mock).mockResolvedValue(1);
        (redis.decr as Mock).mockResolvedValue(0);
        (redis.expire as Mock).mockResolvedValue(1);

        await prisma.failure.deleteMany();
        await prisma.user.deleteMany();
    });

    it('ควรบันทึกลง queue ได้สำเร็จเมื่อมีข้อมูลครบถ้วน', async () => {
        // [Arrange]
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        await prisma.user.create({
            data: mockUser
        });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        const failure = await prisma.failure.create({
            data: {
                title: 'Test Failure',
                description: 'This is a test description.',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${failure.id}/analyze`);
        const params = Promise.resolve({ id: failure.id.toString() });

        // [Act]
        const res = await PUT(req, { params });
        const data = await res.json();

        // [Assert]
        expect(res.status).toBe(202);
        expect(data.message).toBe('Analysis queued');
        expect(aiQueue.add).toHaveBeenCalledWith(
            'analyze',
            expect.objectContaining({ failureId: failure.id }),
            expect.objectContaining({ jobId: `ai_analysis_${failure.id}` })
        );
    });

    it('ควรคืนค่า 401 เมื่อไม่ได้ Login', async () => {
        (getSession as Mock).mockResolvedValue(null);

        const req = new NextRequest(`http://localhost/api/failure/1/analyze`);
        const params = Promise.resolve({ id: '1' });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.message).toBe('Unauthorized');
    })

    it('ควรคืนค่า 403 เมื่อไม่ได้เป็นเจ้าของ Failure', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: otherUser.id } });

        await prisma.user.createMany({
            data: [mockUser, otherUser]
        });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        const failure = await prisma.failure.create({
            data: {
                title: 'Test Failure',
                description: 'This is a test description.',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${failure.id}/analyze`);
        const params = Promise.resolve({ id: failure.id.toString() });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.message).toBe('Forbidden');
    })

    it('ควรคืนค่า 429 เมื่อใช้ AI เกินโควต้า (PRO)', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        // ใช้ mockImplementation เพื่อเช็ค Key
        (redis.incr as Mock).mockImplementation((key: string) => {
            if (key.startsWith('ai_usage:')) {
                return Promise.resolve(101); // เกินโควต้า AI
            }
            return Promise.resolve(1); // ผ่าน Rate Limit ปกติ
        });

        await prisma.user.create({
            data: mockUser
        });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        const failure = await prisma.failure.create({
            data: {
                title: 'Test Failure',
                description: 'This is a test description.',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${failure.id}/analyze`);
        const params = Promise.resolve({ id: failure.id.toString() });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.message).toBe('QUOTA_EXCEEDED');
    })
    it('ควรคืนค่า 429 เมื่อใช้ AI เกินโควต้า (FREE)', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        // [Arrange] กำหนดค่า User ให้เป็น FREE
        await prisma.user.create({
            data: {
                ...mockUser,
                plan: 'FREE' // <--- จุดสำคัญ: เปลี่ยนเป็น FREE
            }
        });

        // [Arrange] ตั้งค่า Redis ให้เหมือนเดิม (101 คือเกินโควต้า 5)
        (redis.incr as Mock).mockImplementation((key: string) => {
            if (key.startsWith('ai_usage:')) {
                return Promise.resolve(101);
            }
            return Promise.resolve(1);
        });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        const failure = await prisma.failure.create({
            data: {
                title: 'Test Failure',
                description: 'This is a test description.',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] }
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${failure.id}/analyze`);
        const params = Promise.resolve({ id: failure.id.toString() });

        // [Act]
        const res = await PUT(req, { params });
        const data = await res.json();

        // [Assert]
        expect(res.status).toBe(429);
        expect(data.message).toBe('QUOTA_EXCEEDED');
    })

    it('ควรคืนค่า 400 เมื่ออยู่ในสถานะ PROCESSING', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        await prisma.user.create({
            data: mockUser
        });

        const category = await prisma.category.findUnique({ where: { name: 'Work' } });
        const emotion = await prisma.emotion.findUnique({ where: { name: 'Sad' } });
        if (!category || !emotion) throw new Error("Seed data missing (Work or Sad)");

        const failure = await prisma.failure.create({
            data: {
                title: 'Test Failure',
                description: 'This is a test description.',
                userId: mockUser.id,
                categoryId: category.id,
                emotions: { connect: [{ id: emotion.id }] },
                aiStatus: 'PROCESSING'
            }
        });

        const req = new NextRequest(`http://localhost/api/failure/${failure.id}/analyze`);
        const params = Promise.resolve({ id: failure.id.toString() });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe('Failure is already processing');
    })

    it('ควนรคืนค่า 404 เมื่อไม่เจอ Failure', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        await prisma.user.create({
            data: mockUser
        });

        const req = new NextRequest(`http://localhost/api/failure/1/analyze`);
        const params = Promise.resolve({ id: '1' });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toBe('Failure not found');
    })

    it('ควรคืนค่า 400 เมื่อ id param ไม่ถูกต้องตาม schema', async () => {
        const req = new NextRequest(`http://localhost/api/failure/abc/analyze`);
        const params = Promise.resolve({ id: 'abc' });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe('ID must be a numeric string');
    })

    it('ควรคืนค่า 429 เมื่อ rate-limit api เกิน', async () => {
        (getSession as Mock).mockResolvedValue({ user: { id: mockUser.id } });

        await prisma.user.create({
            data: mockUser
        });

        (redis.incr as Mock).mockResolvedValue(101);

        const req = new NextRequest(`http://localhost/api/failure/1/analyze`);
        const params = Promise.resolve({ id: '1' });

        const res = await PUT(req, { params });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.message).toBe('Too many requests');
    })
})


