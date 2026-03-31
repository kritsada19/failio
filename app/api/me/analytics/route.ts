import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);

    // 1. Basic Stats
    const totalFailures = await prisma.failure.count({ where: { userId } });
    const totalAnalyzed = await prisma.failure.count({
      where: { userId, aiStatus: "COMPLETED" },
    });

    // 2. Categories Stats
    const topCategories = await prisma.category.findMany({
      where: {
        failures: { some: { userId } },
      },
      include: {
        _count: {
          select: {
            failures: { where: { userId } },
          },
        },
      },
      orderBy: {
        failures: { _count: "desc" },
      },
      take: 5,
    });

    // 3. Emotions Stats
    const emotionsCount = await prisma.emotion.findMany({
      where: {
        failures: { some: { userId } },
      },
      include: {
        _count: {
          select: {
            failures: { where: { userId } },
          },
        },
      },
      orderBy: {
        failures: { _count: "desc" },
      },
      take: 6,
    });

    return NextResponse.json({
      totalFailures,
      totalAnalyzed,
      topCategories: topCategories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.failures,
      })),
      emotions: emotionsCount.map((e) => ({
        id: e.id,
        name: e.name,
        count: e._count.failures,
      })),
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { message: "Error fetching analytics" },
      { status: 500 }
    );
  }
}
