"use client"
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import CardList from "@/components/dashboard/CardList";
import Pagination from "@/components/paginationAndFilter/Pagination";
import Filter from "@/components/paginationAndFilter/Filter";
import Link from "next/link";

interface ResponseData {
  failures: Failure[];
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
      <div className="flex flex-col min-h-screen">

        <div className="flex-1 space-y-4">
          <Filter
            category={category}
            onChange={(value) => {
              setPage(1)
              setCategory(value)
            }}
          />

          <CardList
            data={data?.failures ?? []}
            loading={loading}
            error={error}
          />
        </div>


        {data && (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
        <div className="fixed bottom-6 right-6">
          <Link 
            href='/dashboard/create'
            className="bg-amber-300 w-14 h-14 px-5 py-3 rounded-full text-2xl text-gray-700 shadow-lg hover:bg-amber-400 hover:text-gray-900 transition-all duration-300">
            +
          </Link>
        </div>
      </div>
    </>
  )
}

export default Dashboard