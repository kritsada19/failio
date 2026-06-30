"use server";

import { env } from "@/env";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendEmail";
import { signUpSchema } from "@/lib/validations/auth";
import { getLocale, getTranslations } from "next-intl/server";

export type SignUpState = {
    success: boolean;
    message: string;
    email?: string;
    error?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
    }
}

export async function signUpAction(
    prevState: SignUpState,
    formData: FormData
) {
    const t = await getTranslations("Actions");
    try {
        const token = crypto.randomBytes(32).toString("hex");

        const rawData = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        }

        const result = signUpSchema.safeParse(rawData);

        if (!result.success) {
            return {
                success: false,
                message: t("invalidInput"),
                error: result.error.flatten().fieldErrors
            };
        }

        const { name, email, password } = result.data;

        const existedEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existedEmail) {
            if (!existedEmail.emailVerified) {
                await prisma.user.delete({
                    where: { email },
                });
            } else {
                return {
                    success: false,
                    message: t("emailExists"),
                };
            }
        }

        await prisma.verificationToken.deleteMany({
            where: {
                email,
                type: "EMAIL_VERIFY",
            },
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // บันทึก token, email ลงใน db
        await prisma.verificationToken.create({
            data: {
                email,
                token,
                type: "EMAIL_VERIFY",
                expires: new Date(Date.now() + 3600 * 1000),
            },
        });

        // สร้าง link แนบ token
        const verifyLink = `${env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
        const locale = await getLocale();

        // ส่ง link ให้ email ที่กรอกมาถ้าส่งได้แสดงว่า email นั้นมีจริง
        await sendVerificationEmail(email, verifyLink, locale);

        return {
            success: true,
            email,
            message: t("userCreated"),
        };

    } catch (error) {
        console.error("Error during sign-up:", error);
        return {
            success: false,
            message: t("signUpError"),
        };
    }
}