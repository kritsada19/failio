import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const emotions = await prisma.emotion.findMany();

    return NextResponse.json(emotions, { status: 200 });
  } catch (error) {
    console.error("Error fetching emotions:", error);
    return NextResponse.json(
      { message: "Error fetching emotions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name.trim() || typeof name.trim() !== "string") {
      return NextResponse.json(
        { message: "Invalid emotion name" },
        { status: 400 },
      );
    }

    await prisma.emotion.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(
      { message: "Emotion created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing emotion request:", error);
    return NextResponse.json(
      {
        message: "Invalid request body",
      },
      { status: 500 },
    );
  }
}
