import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendResetEmail } from "@/lib/sendResetEmail";

export async function POST(request: Request) {
  const { email } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: 'PASSWORD_RESET',
      expires: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const link = `http://localhost:3000/reset-password?token=${token}`;

  await sendResetEmail(email, link);

  return NextResponse.json({ message: "Reset email sent" });
}