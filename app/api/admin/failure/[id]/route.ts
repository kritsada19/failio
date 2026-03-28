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
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params;

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!failure) {
            return NextResponse.json(
                { error: "Failure not found" },
                { status: 404 }
            )
        }

        await prisma.failure.delete({
            where: {
                id: failure.id,
            },
        });

        return NextResponse.json({
            message: "Failure deleted successfully",
            status: 200,
        })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
