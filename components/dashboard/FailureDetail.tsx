"use client";
import { useState } from "react";

import { Loader2 } from "lucide-react";


interface FailureData {
  id: number;
  title: string;
  description: string;
  aiStatus: "NOT_STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  aiResult: AiResult | null;
  aiAnalyzedAt: string | null;
  createdAt: Date;
  emotions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
}

interface AiResult {
  summary: string;
  rootCause: string;
  suggestions: string[];
  lesson: string;
}

function FailureDetail({
  failure,
  onAnalyze,
}: {
  failure: FailureData;
  onAnalyze: () => Promise<void> | void;
}) {
  const [isLocalAnalyzing, setIsLocalAnalyzing] = useState(false);
  const isProcessing = failure.aiStatus === "PROCESSING" || isLocalAnalyzing;

  const handleAnalyzeClick = async () => {
    setIsLocalAnalyzing(true);
    try {
      await onAnalyze();
    } finally {
      setIsLocalAnalyzing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return "Analyzing...";

    switch (failure.aiStatus) {
      case "NOT_STARTED":
        return "Analyze with AI";
      case "COMPLETED":
        return "Re-analyze";
      case "FAILED":
        return "Try Again";
      default:
        return "Analyze with AI";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 bg-linear-to-br from-orange-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-6 py-8 sm:px-8">
          {/* title */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-orange-100 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                {failure.category?.name}
              </span>

              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {new Date(failure.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {failure.title}
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Every failure is a reflection point. Review what happened, identify
              the emotions behind it, and turn the lesson into growth.
            </p>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          {/* description */}
          <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-5 sm:p-6 transition-all duration-300">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              What happened
            </h2>

            <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-300">
              {failure.description}
            </p>
          </section>

          {/* emotions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Emotions
            </h2>

            <div className="flex flex-wrap gap-2">
              {failure.emotions.map((emotion) => (
                <span
                  key={emotion?.id}
                  className="rounded-full border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400"
                >
                  {emotion?.name}
                </span>
              ))}
            </div>
          </section>

          {/* ai reflection */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 transition-all duration-300">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  AI Reflection
                </h2>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  Let AI help you reframe this failure into actionable lessons.
                </p>
              </div>

              <button
                onClick={handleAnalyzeClick}
                disabled={isProcessing}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-slate-800 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {getButtonText()}
              </button>
            </div>

            {isProcessing ? (
              <div className="space-y-4 mt-6">
                {/* Skeleton Summary */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-slate-50 dark:bg-slate-900" />
                    <div className="h-3 w-[85%] animate-pulse rounded-full bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>

                {/* Skeleton Suggestions */}
                <div className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="animate-bounce text-sm">✨</span>
                    <div className="h-3 w-32 animate-pulse rounded-full bg-blue-200 dark:bg-blue-800/50" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                    <div className="h-3 w-[90%] animate-pulse rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                  </div>
                </div>

                {/* Skeleton Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <div className="h-2.5 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            ) : failure.aiResult ? (
              <div className="space-y-4 mt-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Summary</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-7">
                    {failure.aiResult.summary}
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4 shadow-sm">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">✨ AI Suggestions</p>
                  <ul className="mt-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                    {failure.aiResult?.suggestions?.map((suggestion, index) => (
                      <li key={index} className="leading-relaxed whitespace-pre-wrap">{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Root Cause</p>
                    <p className="mt-2 font-bold text-slate-800 dark:text-slate-100">{failure.aiResult.rootCause}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lesson Learned</p>
                    <p className="mt-2 font-bold text-slate-800 dark:text-slate-100">{failure.aiResult.lesson}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-5 py-6 text-center">
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 italic">
                  {failure.aiStatus === "FAILED"
                    ? "AI analysis failed. Please try again."
                    : "AI can help analyze this failure and suggest ways to improve."}
                </p>
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  );
}

export default FailureDetail;