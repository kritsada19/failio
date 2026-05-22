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
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }

        const user = await prisma.user.findUnique({
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

        if (user) {
            await redis.set(`user:${session.user.id}`, JSON.stringify(user), "EX", 60 * 60); // Cache for 1 hour
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}