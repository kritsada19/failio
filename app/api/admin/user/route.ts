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
        const newUsers = request.nextUrl.searchParams.get("new") === "true";
        const role = request.nextUrl.searchParams.get("role");
        const search = request.nextUrl.searchParams.get("search");

        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (newUsers) {
            where.createdAt = {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            };
        }

        if (role && role !== "ALL") {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }


        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: limit,
            }),
            prisma.user.count({
                where,
            }),
        ]);

        return NextResponse.json({
            users,
            total,
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
            },
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}