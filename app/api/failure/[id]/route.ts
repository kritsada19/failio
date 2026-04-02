import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const failure = await prisma.failure.findUnique({
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

    if (!failure) {
      return NextResponse.json(
        { message: "Failure not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(failure, { status: 200 });
  } catch (error) {
    console.error("Error fetching failure:", error);
    return NextResponse.json(
      { message: "Failed to fetch failure" },
      { status: 500 },
    );
  }
}
