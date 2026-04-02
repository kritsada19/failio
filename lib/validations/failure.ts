import { z } from "zod";

export const createFailureSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    emotions: z.array(z.string()).optional(),
});

export type CreateFailureSchema = z.infer<typeof createFailureSchema>;

export const updateFailureSchema = z.object({
    id: z.string().min(1, "Id is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    emotions: z.array(z.string()).optional(),
});

export type UpdateFailureSchema = z.infer<typeof updateFailureSchema>;

export const deleteFailureSchema = z.object({
    id: z.number().min(1, "Id is required"),
});

export type DeleteFailureSchema = z.infer<typeof deleteFailureSchema>;