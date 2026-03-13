import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({
      where: { 
        token,
        type: "EMAIL_VERIFY"
      },
    });

    if (!record) {
      return NextResponse.json({ message: "Token not found" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      return NextResponse.json({ message: "Token expired" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: {
          emailVerified: new Date(),
        },
      }),
      prisma.verificationToken.delete({
        where: { 
          token,
          type: 'EMAIL_VERIFY'
        },
      }),
    ]);

    return NextResponse.redirect(new URL("/sign-in", request.url));
  } catch (error) {
    console.error("Error verify email: ", error);

    return NextResponse.json(
      { message: "Failed to verify email" },
      { status: 500 },
    );
  }
}