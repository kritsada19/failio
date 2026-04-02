import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"]
})

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

export type SignInSchema = z.infer<typeof signInSchema>;

export const tokenSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  role: z.string().optional(),
});

export type TokenSchema = z.infer<typeof tokenSchema>;
