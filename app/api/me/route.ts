import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const cached = await redis.get(`user:${session.user.id}`);
        if (cached) {
            const userObj = typeof cached === "string" ? JSON.parse(cached) : cached;
            const isExpired = userObj.plan === "PRO" && 
                             userObj.stripeCurrentPeriodEnd && 
                            //  เช็คว่า plan หมดอายุหรือยัง
                             new Date(userObj.stripeCurrentPeriodEnd) < new Date();
            
            // ถ้า plan ยังไม่หมดอายุ ให้ return ข้อมูลจาก cache
            if (!isExpired) {
                return NextResponse.json(userObj, { status: 200 });
            }
            // If expired, we don't return from cache, we fall through to the DB check and update logic
            console.log(`[Plan Checker] Cached user ${session.user.id} plan expired. Refreshing from DB...`);
        }

        let user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                plan: true,
                stripeStatus: true,
                stripeCurrentPeriodEnd: true,
            },
        });

        if (user && user.plan === "PRO" && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd < new Date()) {
            console.log(`[Plan Checker] User ${user.id} plan expired. Downgrading to FREE.`);
            
            // Update database to FREE
            user = await prisma.user.update({
                where: { id: user.id },
                data: { plan: "FREE" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    plan: true,
                    stripeStatus: true,
                    stripeCurrentPeriodEnd: true,
                },
            });

            // Clear cache to reflect the change
            await redis.del(`user:${session.user.id}`);
        }

        if (user) {
            // ✅ If plan is FREE, don't show expiration date
            if (user.plan === "FREE") {
                user.stripeCurrentPeriodEnd = null;
            }
            if (process.env.NODE_ENV === "production") {
                await (redis as any).set(`user:${session.user.id}`, JSON.stringify(user), { ex: 60 * 60 });
            } else {
                await (redis as any).set(`user:${session.user.id}`, JSON.stringify(user), "EX", 60 * 60);
            }
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}