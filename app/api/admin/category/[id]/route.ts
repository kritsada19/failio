import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            )
        }

        const { id } = await params;

        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!category) {
            return NextResponse.json(
                { message: "Category not found" },
                { status: 404 }
            )
        }

        await prisma.category.delete({
            where: {
                id: category.id,
            },
        });

        return NextResponse.json({
            message: "Category deleted successfully",
            status: 200,
        })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
            },
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { message: "Error updating category" },
            { status: 500 }
        );
    }
}