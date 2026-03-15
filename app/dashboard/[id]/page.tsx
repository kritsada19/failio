"use client"

import { useFetch } from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import { useState } from "react";
import FailureDetail from "@/components/dashboard/FailureDetail";
import axios from "axios";
import Link from "next/link";

interface FailureData {
  id: number;
  title: string;
  description: string;
  aiSuggestion: string | null;
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

function DetailFailurePage() {
  const params = useParams();
  const id = params.id;

  const { data: failure, loading, error, reFetch } =
    useFetch<FailureData>(`/api/failure/${id}`);

  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);

      await axios.post(`/api/failure/${id}/ai`);

      await reFetch();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-orange-600"
          >
            ← Back to My Failures
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-orange-600"
          >
            ← Back to My Failures
          </Link>

          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-medium text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!failure) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-orange-600"
        >
          ← Back to My Failures
        </Link>

        <FailureDetail
          failure={failure}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
        />
      </div>
    </div>
  );
}

export default DetailFailurePage;