import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/getClientIp";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, 5, 60, request);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many requests" },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "PASSWORD_RESET",
      },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 400 }
      );
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: record.id },
      });

      return NextResponse.json(
        { message: "Token expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}