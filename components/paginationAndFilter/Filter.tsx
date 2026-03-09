"use client"
import { useFetch } from "@/hooks/useFetch"

interface FilterProps {
    category: number | undefined
    onChange: (category: number | undefined) => void
}

interface CategoryData {
    id: number;
    name: string;
}

function Filter({ category, onChange }: FilterProps) {
    const { data, loading } = useFetch<CategoryData[]>("/api/category")

    if (loading) {
        return <div className="h-8">Loading...</div>
    }

    return (
        <div className="flex flex-wrap gap-2 mt-4 mb-4 justify-center">

            {/* All button */}
            <button
                onClick={() => onChange(undefined)}
                className={`px-3 py-1 rounded-full border text-sm cursor-pointer
          ${category === undefined ? "bg-black text-white" : "bg-white"}
        `}
            >
                All
            </button>

            {/* category buttons */}
            {data?.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={`px-3 py-1 rounded-full border text-sm cursor-pointer
            ${category === cat.id ? "bg-black text-white" : "bg-white"}
          `}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    )
}

export default Filter