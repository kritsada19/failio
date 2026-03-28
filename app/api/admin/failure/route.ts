import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const page = Number(request.nextUrl.searchParams.get("page")) || 1;
        const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
        const search = request.nextUrl.searchParams.get("search") || "";
        const today = request.nextUrl.searchParams.get("today") === "true";

        const skip = (page - 1) * limit;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const where = {
            AND: [
                today ? { createdAt: { gte: startOfToday } } : {},
                search ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                        { user: { name: { contains: search, mode: "insensitive" } } }
                    ]
                } : {}
            ]
        } as const;

        const [failures, total] = await prisma.$transaction([
            prisma.failure.findMany({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                where: where as any, // Sometimes Prisma types are too deep for TS inference in this context
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    category: true,
                    emotions: true,
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prisma.failure.count({ where: where as any }),
        ]);

        return NextResponse.json(
            {
                failures,
                total,
                pagination: {
                    page,
                    totalPages: Math.ceil(total / limit),
                    limit
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching failures:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}