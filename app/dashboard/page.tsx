"use client"
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import CardList from "@/components/dashboard/CardList";
import Pagination from "@/components/paginationAndFilter/Pagination";
import Filter from "@/components/paginationAndFilter/Filter";
import Link from "next/link";

interface ResponseData {
  failures: Failure[];
  total: number;
  pagination: Pagination;
}

interface Failure {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  category: { id: number; name: string }
  emotions: { id: number; name: string }[];
}

interface Pagination {
  page: number,
  totalPages: number
}

function Dashboard() {
  const [page, setPage] = useState<number>(1);
  const [category, setCategory] = useState<number | undefined>(undefined);
  const { data, loading, error } = useFetch<ResponseData
  >(`/api/failure?page=${page}&limit=10&categoryId=${category}`);

  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-linear-to-br from-orange-50 via-white to-white px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                    My Failures
                  </span>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Reflect on setbacks. Build your next win.
                  </h1>

                  <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                    Review your personal failure logs, filter by category, and
                    turn every difficult moment into a lesson worth keeping.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Failures
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {data?.total ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Total Pages
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {data?.pagination.totalPages ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-2 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Filter by category
                </h2>
                <p className="text-sm text-slate-400">
                  Narrow down your reflections to focus on specific patterns.
                </p>
              </div>
            </div>

            <Filter
              category={category}
              onChange={(value) => {
                setPage(1)
                setCategory(value)
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 py-4">
            <CardList
              data={data?.failures ?? []}
              loading={loading}
              error={error}
            />
          </div>

          {/* Pagination */}
          {data && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>

        {/* Floating create button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href='/dashboard/create'
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-300 text-3xl font-semibold text-slate-800 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-amber-400 hover:text-slate-900"
          >
            +
          </Link>
        </div>
      </div>
    </>
  )
}

export default Dashboard