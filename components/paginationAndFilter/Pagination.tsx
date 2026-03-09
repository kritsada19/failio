"use client"
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex justify-center gap-2 mt-8 mb-10">

            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                <GrFormPrevious />
            </button>

            <span className="px-3 py-1">
                {page} / {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                <GrFormNext />
            </button>

        </div>
    )
}

export default Pagination