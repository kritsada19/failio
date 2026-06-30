import { z } from "zod";

export const createFailureSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.number().min(1, "Category is required"),
    emotions: z.array(z.number()).optional(),
});

export type CreateFailureSchema = z.infer<typeof createFailureSchema>;

export const updateFailureSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "ID must be a numeric string")
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive()),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.number().min(1, "Category is required"),
    emotions: z.array(z.number()).optional(),
});

export type UpdateFailureSchema = z.infer<typeof updateFailureSchema>;

export const deleteFailureSchema = z.object({
    id: z.number().min(1, "Id is required"),
});

export type DeleteFailureSchema = z.infer<typeof deleteFailureSchema>;

export const failureIdParamSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "ID must be a numeric string") // check if the string contains only numbers
        .transform((val) => parseInt(val, 10)) // convert string to number
        .pipe(z.number().int().positive()), // check if the number is a positive integer
});


export type FailureIdParamSchema = z.infer<typeof failureIdParamSchema>;
