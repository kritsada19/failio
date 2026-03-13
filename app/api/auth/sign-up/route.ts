import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendEmail";

export async function POST(requset: Request) {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const { name, email, password } = await requset.json();

    if (!email.includes("@")) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existedEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existedEmail) {
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    });

    await prisma.verificationToken.create({
      data: {
        email: email.trim().toLowerCase(),
        token,
        type: 'EMAIL_VERIFY',
        expires: new Date(Date.now() + 3600 * 1000),
      },
    });

    const verifyLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    await sendVerificationEmail(email, verifyLink);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error during sign-up:", error);
    return NextResponse.json(
      { message: "Server error during sign-up" },
      { status: 500 },
    );
  }
}
