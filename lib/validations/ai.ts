import z from "zod";

export const aiAnalysisSchema = z.object({
    summary: z.string(),
    rootCause: z.string(),
    suggestions: z.array(z.string()),
    lesson: z.string(),
});

export type AIAnalysisSchema = z.infer<typeof aiAnalysisSchema>;
