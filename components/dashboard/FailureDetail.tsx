"use client";
import { useState, useEffect } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Sparkles, CheckCircle2, Search, BrainCircuit, Lightbulb, AlertCircle, RefreshCw, Crown } from "lucide-react";
import Link from "next/link";


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
  userPlan?: "FREE" | "PRO";
  aiUsage?: {
    aiUsedToday: number;
    resetAt: string;
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
  onAnalyze: (resetError?: boolean) => Promise<void> | void;
}) {
  const t = useTranslations("FailureDetail");
  const format = useFormatter();
  const [isLocalAnalyzing, setIsLocalAnalyzing] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const isProcessing = failure.aiStatus === "PROCESSING" || isLocalAnalyzing;

  const thinkingPhrases = [
    t("thinking1"),
    t("thinking2"),
    t("thinking3"),
    t("thinking4"),
    t("thinking5"),
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % thinkingPhrases.length);
      }, 2500);
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing, thinkingPhrases.length]);

  const handleAnalyzeClick = async () => {
    setAnalysisError(null);
    setIsLocalAnalyzing(true);
    try {
      await onAnalyze();
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as { response: { data: { message: string } } };
            setAnalysisError(axiosError.response?.data?.message || "Something went wrong");
        } else if (err instanceof Error) {
            setAnalysisError(err.message);
        } else {
            setAnalysisError("An unknown error occurred");
        }
    } finally {
      setIsLocalAnalyzing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return t("analyzing");

    switch (failure.aiStatus) {
      case "NOT_STARTED":
        return t("analyzeWithAi");
      case "COMPLETED":
        return t("reAnalyze");
      case "FAILED":
        return t("tryAgain");
      default:
        return t("analyzeWithAi");
    }
  };

  const getLimitInfo = () => {
    if (!failure.aiUsage) return null;
    
    if (failure.userPlan === "PRO") {
        return {
            text: t("proUnlimited"),
            isFull: false,
            remaining: Infinity
        };
    }

    const used = failure.aiUsage.aiUsedToday;
    const limit = 5;
    const left = Math.max(0, limit - used);

    return {
        text: left > 0 ? t("remaining", { remaining: left }) : t("dailyLimitReached"),
        isFull: left <= 0,
        remaining: left
    };
  };

  const limitInfo = getLimitInfo();

  const renderErrorMessage = () => {
      if (!analysisError && failure.aiStatus !== "FAILED") return null;

      const errorKey = analysisError || "aiAnalysisFailed";
      
      let displayMessage = t("aiAnalysisFailed");
      let showUpgrade = false;

      if (errorKey === "QUOTA_EXCEEDED") {
          displayMessage = t("quotaExceeded");
          showUpgrade = true;
      } else if (errorKey === "AI_INVALID_RESPONSE") {
          displayMessage = t("aiInvalidResponse");
      } else if (errorKey === "AI_SCHEMA_INVALID") {
          displayMessage = t("aiSchemaInvalid");
      }

      return (
        <div className="mt-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 p-5 animate-shake">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-rose-500 shrink-0" />
                <div className="space-y-3">
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                        {displayMessage}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAnalyzeClick}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                            {t("retryBtn")}
                        </button>
                        
                        {showUpgrade && (
                            <Link
                                href="/subscription"
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-sm transition-all hover:bg-slate-800 dark:hover:bg-white active:scale-95"
                            >
                                <Crown className="h-3.5 w-3.5 text-orange-400" />
                                {t("upgradeToPro")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

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
                {format.dateTime(new Date(failure.createdAt), {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {failure.title}
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("reflectionPoint")}
            </p>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          {/* description */}
          <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-5 sm:p-6 transition-all duration-300">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("whatHappened")}
            </h2>

            <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-300">
              {failure.description}
            </p>
          </section>

          {/* emotions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("emotions")}
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
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  {t("aiReflection")}
                  {failure.userPlan === "PRO" && (
                    <Crown className="h-4 w-4 text-orange-400" />
                  )}
                </h3>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  {t("aiReflectionDesc")}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                    onClick={handleAnalyzeClick}
                    disabled={isProcessing || (limitInfo?.isFull && failure.aiStatus === "NOT_STARTED")}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-900 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-slate-800 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isProcessing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                    {getButtonText()}
                </button>
                
                {limitInfo && (
                    <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                            limitInfo.isFull 
                            ? "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400" 
                            : "border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                        }`}>
                            {limitInfo.text}
                        </span>
                        {limitInfo.isFull && (
                            <Link 
                                href="/subscription" 
                                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1"
                            >
                                <Crown className="h-3 w-3" />
                                {t("upgradeToPro")}
                            </Link>
                        )}
                    </div>
                )}
              </div>
            </div>

            {isProcessing ? (
              <div className="space-y-4 mt-6 animate-pulse">
                <div className="flex flex-col items-center justify-center py-4 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-orange-200 dark:bg-orange-900/30 opacity-75"></div>
                    <div className="relative rounded-full bg-orange-100 dark:bg-orange-900/50 p-3">
                      <BrainCircuit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400 animate-bounce">
                    {thinkingPhrases[thinkingIndex]}
                  </p>
                </div>

                {/* Skeleton Summary */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-orange-100/10 dark:via-orange-400/5 to-transparent animate-shimmer" style={{ width: '200%' }}></div>
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <div className="h-3 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded-full bg-slate-50 dark:bg-slate-900" />
                    <div className="h-3 w-[85%] rounded-full bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>

                {/* Skeleton Suggestions */}
                <div className="relative overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4 shadow-sm">
                   <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-blue-200/20 dark:via-blue-400/10 to-transparent animate-shimmer" style={{ width: '200%' }}></div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <div className="h-3 w-32 rounded-full bg-blue-200 dark:bg-blue-800/50" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                    <div className="h-3 w-[90%] rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                  </div>
                </div>

                {/* Skeleton Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <div className="h-2.5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-4 w-full rounded-full bg-slate-100 dark:bg-slate-900" />
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm">
                    <div className="h-2.5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-4 w-full rounded-full bg-slate-100 dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            ) : failure.aiResult ? (
              <div className="space-y-4 mt-6 animate-pop">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{t("analysisComplete")}</span>
                </div>

                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("summary")}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-7">
                    {failure.aiResult.summary}
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-4 shadow-sm animate-fade-in-up animate-delay-100">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> {t("aiSuggestions")}
                  </p>
                  <ul className="mt-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                    {failure.aiResult?.suggestions?.map((suggestion, index) => (
                      <li key={index} className="leading-relaxed whitespace-pre-wrap">{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm animate-fade-in-up animate-delay-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-4 w-4 text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("rootCause")}</p>
                    </div>
                    <p className="mt-2 font-bold text-slate-800 dark:text-slate-100">{failure.aiResult.rootCause}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm animate-fade-in-up animate-delay-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("lessonLearned")}</p>
                    </div>
                    <p className="mt-2 font-bold text-slate-800 dark:text-slate-100">{failure.aiResult.lesson}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-5 py-6 text-center mt-6">
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 italic">
                    {failure.aiStatus === "FAILED"
                        ? t("aiAnalysisFailed")
                        : t("aiCanHelp")}
                    </p>
                </div>
                {renderErrorMessage()}
              </>
            )}

          </section>
        </div>
      </div>
    </div>
  );
}

export default FailureDetail;