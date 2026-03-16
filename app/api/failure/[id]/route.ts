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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: String(session.user.id),
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const failure = await prisma.failure.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!failure) {
      return NextResponse.json(
        { message: "Failure not found" },
        { status: 404 },
      );
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = user.id === failure.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, categoryId, emotions } = await request.json();

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await prisma.failure.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        categoryId: Number(categoryId),
        emotions: Array.isArray(emotions)
          ? {
            set: emotions.map((id: number) => ({ id })),
          }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "Failure updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating failure:", error);
    return NextResponse.json(
      { message: "Failed to update failure" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: String(session.user.id),
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const failure = await prisma.failure.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!failure) {
      return NextResponse.json(
        { message: "Failure not found" },
        { status: 404 },
      );
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = user.id === failure.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.failure.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      { message: "Failure deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting failure:", error);
    return NextResponse.json(
      { message: "Failed to delete failure" },
      { status: 500 },
    );
  }
}
