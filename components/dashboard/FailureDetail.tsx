"use client"

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

function FailureDetail({
  failure,
  onAnalyze,
  analyzing
}: {
  failure: FailureData;
  onAnalyze: () => void;
  analyzing: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">

        {/* title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {failure.title}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            {new Date(failure.createdAt).toLocaleString()}
          </p>
        </div>

        {/* category */}
        <div>
          <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full">
            {failure.category.name}
          </span>
        </div>

        {/* description */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            What happened
          </h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {failure.description}
          </p>
        </div>

        {/* emotions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Emotions
          </h2>

          <div className="flex gap-2 flex-wrap">
            {failure.emotions.map((emotion) => (
              <span
                key={emotion.id}
                className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-full"
              >
                {emotion.name}
              </span>
            ))}
          </div>
        </div>

        {/* ai suggestion */}
        <div className="border-t pt-5">

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">
              AI Reflection
            </h2>

            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>

          {failure.aiSuggestion ? (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
              {failure.aiSuggestion}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              AI can help analyze this failure and suggest ways to improve.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default FailureDetail;