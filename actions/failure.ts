"use server"

import prisma from "@/lib/prisma"
import { createFailureSchema, updateFailureSchema, deleteFailureSchema } from "@/lib/validations/failure";
import { getSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

export type FailureState = {
    success: boolean;
    message: string;
    error?: {
        title?: string[];
        description?: string[];
        categoryId?: string[];
        emotions?: string[];
    };
}

export async function createFailure(
    prevState: FailureState,
    formData: FormData
) {
    const t = await getTranslations("Actions");
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: t("unauthorized"),
            };
        }

        const validatedFields = createFailureSchema.safeParse({
            title: formData.get("title"),
            description: formData.get("description"),
            categoryId: Number(formData.get("categoryId")),
            emotions: formData.getAll("emotions").map((id) => Number(id)),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: t("invalidFields"),
                error: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { title, description, categoryId, emotions } = validatedFields.data;

        await prisma.failure.create({
            data: {
                title,
                description,
                userId: String(session.user.id),
                categoryId,
                emotions: Array.isArray(emotions)
                    ? {
                        connect: emotions.map((id) => ({ id })),
                    }
                    : undefined,
            },
        });

        return {
            success: true,
            message: t("createSuccess"),
        };

    } catch (error) {
        console.error("Error during create failure:", error);
        return {
            success: false,
            message: t("createError"),
        };
    }
}

export async function updateFailure(
    prevState: FailureState,
    formData: FormData
) {
    const t = await getTranslations("Actions");
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: t("unauthorized"),
            };
        }


        const validatedFields = updateFailureSchema.safeParse({
            id: formData.get("id"),
            title: formData.get("title"),
            description: formData.get("description"),
            categoryId: formData.get("categoryId"),
            emotions: formData.getAll("emotions").map((id) => Number(id)),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: t("invalidFields"),
                error: validatedFields.error.flatten().fieldErrors,
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: String(session.user.id),
            },
        });

        if (!user) {
            return {
                success: false,
                message: t("userNotFound"),
            };
        }

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(formData.get("id")),
            },
        });

        if (!failure) {
            return {
                success: false,
                message: t("failureNotFound"),
            };
        }

        const isAdmin = user.role === "ADMIN";
        const isOwner = user.id === failure.userId;

        if (!isAdmin && !isOwner) {
            return {
                success: false,
                message: t("forbidden"),
            };
        }

        const { id, title, description, categoryId, emotions } = validatedFields.data;

        await prisma.failure.update({
            where: {
                id: Number(id),
            },
            data: {
                title,
                description,
                categoryId,
                emotions: Array.isArray(emotions)
                    ? {
                        set: emotions.map((id) => ({ id })),
                    }
                    : undefined,
            },
        });

        return {
            success: true,
            message: t("updateSuccess"),
        };

    } catch (error) {
        console.error("Error during update failure:", error);
        return {
            success: false,
            message: t("updateError"),
        };
    }
}

export async function deleteFailure(id: number) {
    const t = await getTranslations("Actions");
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: t("unauthorized"),
            };
        }

        const validatedFields = deleteFailureSchema.safeParse({
            id,
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: t("invalidFields"),
                error: validatedFields.error.flatten().fieldErrors,
            };
        }

        const failure = await prisma.failure.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!failure) {
            return {
                success: false,
                message: t("failureNotFound"),
            };
        }

        const isAdmin = session.user.role === "ADMIN";
        const isOwner = session.user.id === failure.userId;

        if (!isAdmin && !isOwner) {
            return {
                success: false,
                message: t("forbidden"),
            };
        }

        await prisma.failure.delete({
            where: {
                id: Number(id),
            },
        });

        return {
            success: true,
            message: t("deleteSuccess"),
        };
    } catch (error) {
        console.error("Error during delete failure:", error);
        return {
            success: false,
            message: t("deleteError"),
        };
    }
}