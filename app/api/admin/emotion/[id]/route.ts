import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const emotion = await prisma.emotion.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
            },
        });

        return NextResponse.json(emotion, { status: 200 });
    } catch (error) {
        console.error("Error updating emotion:", error);
        return NextResponse.json(
            { message: "Error updating emotion" },
            { status: 500 }
        );
    }
}

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

        const emotion = await prisma.emotion.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!emotion) {
            return NextResponse.json(
                { message: "Emotion not found" },
                { status: 404 }
            )
        }

        await prisma.emotion.delete({
            where: {
                id: emotion.id,
            },
        });

        return NextResponse.json({
            message: "Emotion deleted successfully",
            status: 200,
        })

    } catch (error) {
        console.error("Error deleting emotion:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}