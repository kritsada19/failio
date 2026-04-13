"use client";
import { useFetch } from "@/hooks/useFetch";

interface FilterProps {
    category: number | undefined;
    onChange: (category: number | undefined) => void;
}

interface CategoryData {
    id: number;
    name: string;
}

function Filter({ category, onChange }: FilterProps) {
    const { data, loading } = useFetch<CategoryData[]>("/api/category");

    if (loading) {
        return (
            <div className="mt-4 mb-4 flex justify-center">
                <div className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 mb-6 flex flex-wrap justify-center gap-3">
            {/* All button */}
            <button
                onClick={() => onChange(undefined)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm
          ${category === undefined
                        ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-slate-900 dark:hover:text-white"
                    }
        `}
            >
                All
            </button>

            {/* category buttons */}
            {data?.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm
            ${category === cat.id
                            ? "border-orange-500 dark:border-orange-400 bg-orange-500 dark:bg-orange-400 text-white dark:text-slate-900"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-slate-900 dark:hover:text-white"
                        }
          `}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

export default Filter;