"use client"

import { useFetch } from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import FailureDetail from "@/components/dashboard/FailureDetail";
import axios from "axios";
import Link from "next/link";

interface FailureData {
  id: number;
  title: string;
  description: string;
  aiStatus: "NOT_STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  aiResult: AiResult | null
  aiAnalyzedAt: string;
  createdAt: Date;
  emotions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  userPlan: "FREE" | "PRO";
  aiUsage: {
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

function DetailFailurePage() {
  const params = useParams();
  const id = params.id;

  const { data: failure, loading, error, reFetch } =
    useFetch<FailureData>(`/api/failure/${id}`);

  const handleAnalyze = async () => {
    try {
      await axios.put(`/api/failure/${id}/analyze`);
      await reFetch();
    } catch (err) {
      console.error(err);
      throw err; // Re-throw to allow FailureDetail to catch it
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-orange-600"
          >
            ← Back to My Failures
          </Link>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-orange-600"
          >
            ← Back to My Failures
          </Link>

          <div className="rounded-3xl border border-red-100 dark:border-red-900/50 bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!failure) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex text-sm font-medium text-slate-500 dark:text-slate-500 transition-colors duration-200 hover:text-orange-600 dark:hover:text-orange-400"
        >
          ← Back to My Failures
        </Link>

        <FailureDetail
          failure={failure}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
}

export default DetailFailurePage;