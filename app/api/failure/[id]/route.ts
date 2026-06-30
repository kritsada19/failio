import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    let failure;

    const cached = await redis.get(`failure:${id}`);

    if (cached) {
      try {
        failure = JSON.parse(cached as string);
      } catch {
        await redis.del(`failure:${id}`);
      }
    }

    if (!failure) {
      failure = await prisma.failure.findUnique({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          title: true,
          description: true,
          aiStatus: true,
          aiResult: true,
          aiAnalyzedAt: true,
          createdAt: true,
          userId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          emotions: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (failure) {
        await redis.set(
          `failure:${id}`,
          JSON.stringify(failure),
          "EX",
          60 * 30
        );
      }
    }

    if (!failure) {
      return NextResponse.json(
        { message: "Failure not found" },
        { status: 404 },
      );
    }

    const [user, aiUsage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          plan: true,
        },
      }),
      redis.get(`ai_usage:${session.user.id}`),
    ]);

    return NextResponse.json({
      ...failure,
      userPlan: user?.plan || "FREE",
      aiUsage: Number(aiUsage || 0),
    });

  } catch (error) {
    console.error("Error fetching failure:", error);

    return NextResponse.json(
      { message: "Failed to fetch failure" },
      { status: 500 },
    );
  }
}