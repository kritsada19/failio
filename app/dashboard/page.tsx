"use client"
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import CardList from "@/components/dashboard/CardList";
import Pagination from "@/components/paginationAndFilter/Pagination";
import Filter from "@/components/paginationAndFilter/Filter";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { useTranslations } from 'next-intl';

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
  aiStatus: "NOT_STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const t = useTranslations('Dashboard');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, reFetch } = useFetch<ResponseData>(
    `/api/failure?page=${page}&limit=10&categoryId=${category || ""}&search=${debouncedSearch}`
  );

  useEffect(() => {
    const hasProcessing = data?.failures.some((f) => f.aiStatus === "PROCESSING");
    if (hasProcessing) {
      const interval = setInterval(() => {
        reFetch(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.failures, reFetch]);

  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-linear-to-br from-orange-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full border border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                    {t('myFailures')}
                  </span>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                    {t('title')}
                  </h1>

                   <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                    {t('description')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t('failuresCount')}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                      {data?.total ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t('totalPages')}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                      {data?.pagination.totalPages ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 py-4 shadow-sm sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  {t('findReflections')}
                </h2>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20"
                  />
                </div>
              </div>

              <div className="w-full md:w-auto">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  {t('filterCategory')}
                </h2>
                <Filter
                  category={category}
                  onChange={(value) => {
                    setPage(1)
                    setCategory(value)
                  }}
                />
              </div>
            </div>
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
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-300 dark:bg-amber-400 text-3xl font-semibold text-slate-800 dark:text-slate-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-amber-400 dark:hover:bg-amber-500 hover:text-slate-900"
          >
            +
          </Link>
        </div>
      </div>
    </>
  )
}

export default Dashboard