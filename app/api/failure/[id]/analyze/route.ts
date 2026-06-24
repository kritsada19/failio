import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/getClientIp";
import { aiQueue } from "@/lib/ai-analysis/queue";
import { failureIdParamSchema } from "@/lib/validations/failure";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const rawParams = await params;
    const validatedParams = failureIdParamSchema.safeParse(rawParams);

    if (!validatedParams.success) {
        return NextResponse.json(
            { message: validatedParams.error.issues[0].message },
            { status: 400 }
        );
    }

    const { id } = validatedParams.data;


    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, 20, 60, request);

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
                id: id,
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

        let user = await prisma.user.findUnique({
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

        // ✅ Lazy check subscription expiration
        if (user.plan === "PRO" && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd < new Date()) {
            console.log(`[Plan Checker] User ${user.id} plan expired during analysis request. Downgrading to FREE.`);
            user = await prisma.user.update({
                where: { id: user.id },
                data: { plan: "FREE" },
            });
            // Clear user cache
            await redis.del(`user:${user.id}`);
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

        if (user.plan === "PRO" && Number(aiUsage) > 100) {
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
        }, {
            jobId: `ai_analysis_${failure.id}`,
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