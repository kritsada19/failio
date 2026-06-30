"use client";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="mt-8 mb-10 flex items-center justify-center gap-4">
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <GrFormPrevious className="text-xl" />
            </button>

            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                {page} <span className="text-slate-400 dark:text-slate-500">/</span> {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <GrFormNext className="text-xl" />
            </button>
        </div>
    );
}

export default Pagination;