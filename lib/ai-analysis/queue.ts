/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, Worker, Job } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { runAIAnalysis } from "./run-analysis";
import { env } from "@/env";

// BullMQ requires a raw ioredis ConnectionOptions object — it manages its own
// internal ioredis instance. Passing an externally-created Redis instance
// causes a type conflict between the top-level ioredis and BullMQ's bundled copy.
//
// Production: set REDIS_URL to the Upstash TCP URL (rediss://...)
//             found in Upstash Dashboard → Connect → ioredis
// Local:      falls back to localhost:6379 automatically
const bullmqConnection: ConnectionOptions = process.env.REDIS_URL
    ? {
          // Parse the full Redis URL (e.g. rediss://default:<token>@host:port)
          host: new URL(process.env.REDIS_URL).hostname,
          port: Number(new URL(process.env.REDIS_URL).port),
          username: new URL(process.env.REDIS_URL).username || undefined,
          password: new URL(process.env.REDIS_URL).password || undefined,
          // Enable TLS for rediss:// (Upstash requires it)
          tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
          maxRetriesPerRequest: null,
      }
    : {
          host: process.env.REDIS_HOST ?? "localhost",
          port: Number(process.env.REDIS_PORT ?? 6379),
          maxRetriesPerRequest: null,
      };

// Create a queue for AI analysis
export const aiQueue = new Queue("ai-analysis", {

    // Redis connection (raw options — BullMQ manages its own ioredis instance)
    connection: bullmqConnection,

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
                // Set a manual timeout for the AI analysis (2 minutes)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("AI_TIMEOUT")), 120000)
                );

                const aiResponse = await Promise.race([
                    runAIAnalysis(failure.title, failure.description),
                    timeoutPromise,
                ]);

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

                const isQuotaError = error instanceof Error && error.message === "AI_QUOTA_EXCEEDED";

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

                // Don't retry on quota exceeded — it won't help
                if (isQuotaError) {
                    console.warn(`[AI Worker] Quota exceeded for failure ${failureId}, skipping retries.`);
                    return;
                }

                throw error; // Allow BullMQ to handle retries for other errors
            }
        },

        // Redis connection (raw options — BullMQ manages its own ioredis instance)
        {
            connection: bullmqConnection,

            // Allow 3 jobs to run at the same time
            concurrency: Number(env.CONCURRENCY_LIMIT),
        }
    );

    // Event handler for failed jobs
    worker.on("failed", (job, err) => {
        console.error(`[AI Worker] Job ${job?.id} failed:`, err);
    });
};
