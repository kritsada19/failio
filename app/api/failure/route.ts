import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const page = Number(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
    const categoryId = Number(request.nextUrl.searchParams.get("categoryId")) || undefined;
    const search = request.nextUrl.searchParams.get("search") || "";

    const version = await redis.get(`failures_version:${session.user.id}`) || "0";
    const cacheKey = `failures:${session.user.id}:${version}:${page}:${limit}:${categoryId || 'all'}:${search}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached as string), { status: 200 });
    }

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: String(session.user.id),
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [failures, total] = await prisma.$transaction([
      prisma.failure.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          aiStatus: true,
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
      }),
      prisma.failure.count({
        where,
      }),
    ]);

    const result = {
      failures,
      total,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 30); // Cache for 30 minutes

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching failures:", error);
    return NextResponse.json(
      { message: "Failed to fetch failures" },
      { status: 500 },
    );
  }
}
