"use client";

interface FailureData {
  id: number;
  title: string;
  description: string;
  aiStatus: "NOT_STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  aiResult: string | null;
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

function FailureDetail({
  failure,
  onAnalyze,
}: {
  failure: FailureData;
  onAnalyze: () => void;
}) {
  const isProcessing = failure.aiStatus === "PROCESSING";

  const getButtonText = () => {
    switch (failure.aiStatus) {
      case "NOT_STARTED":
        return "Analyze with AI";
      case "PROCESSING":
        return "Analyzing...";
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
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-br from-orange-50 via-white to-white px-6 py-8 sm:px-8">
          {/* title */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {failure.category.name}
              </span>

              <span className="text-xs font-medium text-slate-400">
                {new Date(failure.createdAt).toLocaleString()}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {failure.title}
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Every failure is a reflection point. Review what happened, identify
              the emotions behind it, and turn the lesson into growth.
            </p>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          {/* description */}
          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              What happened
            </h2>

            <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
              {failure.description}
            </p>
          </section>

          {/* emotions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Emotions
            </h2>

            <div className="flex flex-wrap gap-2">
              {failure.emotions.map((emotion) => (
                <span
                  key={emotion.id}
                  className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600"
                >
                  {emotion.name}
                </span>
              ))}
            </div>
          </section>

          {/* ai reflection */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  AI Reflection
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Let AI help you reframe this failure into actionable lessons.
                </p>
              </div>

              <button
                onClick={onAnalyze}
                disabled={isProcessing}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {getButtonText()}
              </button>
            </div>

            {failure.aiResult ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                {failure.aiResult}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
                <p className="text-sm leading-6 text-slate-500">
                  {failure.aiStatus === "PROCESSING"
                    ? "AI is currently analyzing this failure..."
                    : failure.aiStatus === "FAILED"
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