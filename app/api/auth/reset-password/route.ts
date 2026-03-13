import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  const record = await prisma.verificationToken.findUnique({
    where: {
      token,
      type: "PASSWORD_RESET",
    },
  });

  if (!record) {
    return NextResponse.json({ message: "Invalid token" });
  }

  if (record.expires < new Date()) {
    return NextResponse.json({ message: "Token expired" });
  }

  if (!password) {
    return NextResponse.json({ message: "Invalid password" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: {
      token,
      type: "PASSWORD_RESET",
    },
  });

  return NextResponse.json({ message: "Password updated" }, { status: 201 });
}
