import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/getClientIp";
import { aiQueue } from "@/lib/ai-analysis/queue";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, 5, 60, request);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { message: "Too many requests" },
            { status: 429 }
        );
    }
    
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!failure) {
            return NextResponse.json(
                { message: "Failure not found" },
                { status: 404 }
            );
        }

        if (failure.aiStatus === "PROCESSING") {
            return NextResponse.json(
                { message: "Failure is already processing" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: String(session.user.id),
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const isOwner = user.id === failure.userId;
        if (!isOwner) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const aiUsageKey = `ai_usage:${session.user.id}`;
        const aiUsage = await redis.incr(aiUsageKey);

        if (Number(aiUsage) === 1) {
            await redis.expire(aiUsageKey, 60 * 60 * 24);
        }

        if (user.plan === "FREE" && Number(aiUsage) > 5) {
            await redis.decr(aiUsageKey);
            return NextResponse.json({ message: "QUOTA_EXCEEDED" }, { status: 429 });
        }

        // Update status to PROCESSING
        await prisma.failure.update({
            where: { id: failure.id },
            data: { aiStatus: "PROCESSING" },
        });

        // Enqueue background job
        await aiQueue.add("analyze", {
            failureId: failure.id,
            userId: session.user.id,
        });

        return NextResponse.json(
            { message: "Analysis queued" },
            { status: 202 }
        );

    } catch (error: unknown) {
        console.error("Analysis Queue Error:", error);
        
        let message = "Internal Server Error";
        if (error instanceof Error) {
            message = error.message;
        }

        return NextResponse.json({ message: message }, { status: 500 });
    }
}