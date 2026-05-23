/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { runAIAnalysis } from "./run-analysis";

// Create a queue for AI analysis
export const aiQueue = new Queue("ai-analysis", {

    // Redis connection
    connection: redis,

    // Set default job options
    defaultJobOptions: {
        // Retry 3 times
        attempts: 3,

        // Exponential backoff
        backoff: {
            type: "exponential",
            delay: 1000,
        },

        // Remove job from queue after completion
        removeOnComplete: true,

        // Don't remove job from queue after failure
        removeOnFail: false,
    },
});

// Worker instance
let worker: Worker | null = null;

export const initAIWorker = () => {
    // If worker is already initialized, return
    if (worker) return;

    // Create worker
    worker = new Worker(
        // Queue name
        "ai-analysis",

        // Function to run every time a job enters the queue
        async (job: Job) => {
            const { failureId, userId } = job.data;
            console.log(`[AI Worker] Processing failure ${failureId} for user ${userId}`);

            const failure = await prisma.failure.findUnique({
                where: { id: failureId },
            });
            if (!failure) return;

            try {
                const aiResponse = await runAIAnalysis(
                    failure.title,
                    failure.description
                );

                await prisma.failure.update({
                    where: { id: failure.id },
                    data: {
                        aiResult: aiResponse as any,
                        aiStatus: "COMPLETED",
                        aiAnalyzedAt: new Date(),
                    },
                });

                // Clear cache and increment version for real-time updates/caching
                await redis.del(`failure:${failureId}`);
                await redis.incr(`failures_version:${userId}`);

                console.log(`[AI Worker] Successfully processed failure ${failureId}`);
            } catch (error) {
                console.error(`[AI Worker] Error processing failure ${failureId}:`, error);

                // Update status to FAILED and rollback AI usage count
                await prisma.failure.update({
                    where: { id: failure.id },
                    data: { aiStatus: "FAILED" },
                });

                const aiUsageKey = `ai_usage:${userId}`;
                const usage = await redis.get(aiUsageKey);
                if (Number(usage) > 0) {
                    await redis.decr(aiUsageKey);
                }

                throw error; // Allow BullMQ to handle retries based on policy
            }
        },

        // Redis connection
        {
            connection: redis,

            // Allow 3 jobs to run at the same time
            concurrency: 3,
        }
    );

    // Event handler for failed jobs
    worker.on("failed", (job, err) => {
        console.error(`[AI Worker] Job ${job?.id} failed:`, err);
    });
};
