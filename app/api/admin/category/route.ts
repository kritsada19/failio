import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const top = request.nextUrl.searchParams.get("top") === "true";
        const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        failures: true,
                    },
                },
            },
            orderBy: top
                ? {
                    failures: {
                        _count: "desc",
                    },
                }
                : {
                    id: "desc",
                },
            take: top ? limit : undefined,
        });

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { message: "Error fetching categories" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { message: "Error creating category" },
            { status: 500 }
        );
    }
}