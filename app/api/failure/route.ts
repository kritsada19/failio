import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const page = Number(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
    const categoryId =
      Number(request.nextUrl.searchParams.get("categoryId")) || undefined;

    const skip = (page - 1) * limit;
    const category = categoryId ? categoryId : {};

    const [failures, total] = await prisma.$transaction([
      prisma.failure.findMany({
        where: {
          categoryId: category,
          userId: String(session.user.id),
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
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
      }),
      prisma.failure.count({
        where: {
          categoryId: category,
        },
      }),
    ]);

    return NextResponse.json(
      {
        data: failures,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching failures:", error);
    return NextResponse.json(
      { message: "Failed to fetch failures" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, categoryId, emotions } = await request.json();

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await prisma.failure.create({
      data: {
        title,
        description,
        userId: String(session.user.id),

        categoryId: Number(categoryId),

        emotions: Array.isArray(emotions)
          ? {
              connect: emotions.map((id: number) => ({ id })),
            }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "Failure created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating failure:", error);

    return NextResponse.json(
      { message: "Failed to create failure" },
      { status: 500 },
    );
  }
}
