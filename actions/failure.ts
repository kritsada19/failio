"use server"

import prisma from "@/lib/prisma"
import { createFailureSchema, updateFailureSchema, deleteFailureSchema } from "@/lib/validations/failure";
import { getSession } from "@/lib/auth";

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
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const validatedFields = createFailureSchema.safeParse({
            title: formData.get("title"),
            description: formData.get("description"),
            categoryId: formData.get("categoryId"),
            emotions: formData.getAll("emotions"),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Invalid fields",
                error: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { title, description, categoryId, emotions } = validatedFields.data;

        await prisma.failure.create({
            data: {
                title,
                description,
                userId: String(session.user.id),
                categoryId: Number(categoryId),
                emotions: Array.isArray(emotions)
                    ? {
                        connect: emotions.map((id: string) => ({ id: Number(id) })),
                    }
                    : undefined,
            },
        });

        return {
            success: true,
            message: "Failure created successfully",
        };

    } catch (error) {
        console.error("Error during create failure:", error);
        return {
            success: false,
            message: "Server error during create failure",
        };
    }
}

export async function updateFailure(
    prevState: FailureState,
    formData: FormData
) {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }


        const validatedFields = updateFailureSchema.safeParse({
            id: formData.get("id"),
            title: formData.get("title"),
            description: formData.get("description"),
            categoryId: formData.get("categoryId"),
            emotions: formData.getAll("emotions"),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Invalid fields",
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
                message: "User not found",
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
                message: "Failure not found",
            };
        }

        const isAdmin = user.role === "ADMIN";
        const isOwner = user.id === failure.userId;

        if (!isAdmin && !isOwner) {
            return {
                success: false,
                message: "Forbidden",
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
                categoryId: Number(categoryId),
                emotions: Array.isArray(emotions)
                    ? {
                        set: emotions.map((id: string) => ({ id: Number(id) })),
                    }
                    : undefined,
            },
        });

        return {
            success: true,
            message: "Failure updated successfully",
        };

    } catch (error) {
        console.error("Error during update failure:", error);
        return {
            success: false,
            message: "Server error during update failure",
        };
    }
}

export async function deleteFailure(id: number) {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const validatedFields = deleteFailureSchema.safeParse({
            id,
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Invalid fields",
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
                message: "Failure not found",
            };
        }

        const isAdmin = session.user.role === "ADMIN";
        const isOwner = session.user.id === failure.userId;

        if (!isAdmin && !isOwner) {
            return {
                success: false,
                message: "Forbidden",
            };
        }

        await prisma.failure.delete({
            where: {
                id: Number(id),
            },
        });

        return {
            success: true,
            message: "Failure deleted successfully",
        };
    } catch (error) {
        console.error("Error during delete failure:", error);
        return {
            success: false,
            message: "Server error during delete failure",
        };
    }
}