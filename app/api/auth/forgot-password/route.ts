import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendResetEmail } from "@/lib/sendResetEmail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        type: "PASSWORD_RESET",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // แนบ token กับหน้า frontend เพราะ frontend ต้องส่ง password ด้วย
    const link = `http://localhost:3000/reset-password?token=${token}`;

    await sendResetEmail(email, link);

    return NextResponse.json(
      { message: "Reset email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}