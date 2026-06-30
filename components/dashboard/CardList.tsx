"use client"

import Link from "next/link"
import { useState } from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiZap, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi"
import { deleteFailure } from "@/actions/failure"
import { toast } from "sonner"

interface CardListProps {
  data: Failure[]
  loading: boolean
  error: string | null
}

interface Failure {
  id: number
  title: string
  description: string
  createdAt: string
  aiStatus: "NOT_STARTED" | "PROCESSING" | "COMPLETED" | "FAILED"
  category: { id: number; name: string }
  emotions: { id: number; name: string }[]
}

function Cardlist({ data, loading, error }: CardListProps) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const getAiStatusIcon = (status: Failure["aiStatus"]) => {
    switch (status) {
      case "COMPLETED":
        return <FiCheckCircle className="text-emerald-500" size={14} title="Analyzed" />
      case "PROCESSING":
        return <FiClock className="text-amber-500 animate-pulse" size={14} title="Analyzing..." />
      case "FAILED":
        return <FiAlertCircle className="text-red-500" size={14} title="Analysis Failed" />
      default:
        return <FiZap className="text-slate-300" size={14} title="Not Analyzed" />
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await deleteFailure(deleteId)
      if (response.success) {
        toast.success(response.message)
        setTimeout(() => {
          window.location.reload()
        }, 800)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-sm font-medium text-slate-500">
        Loading...
      </p>
    )
  }

  if (error) {
    return (
      <p className="py-12 text-center text-sm font-medium text-red-500">
        {error}
      </p>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mx-6 mt-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-6 py-14 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No failures yet</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Start writing your first reflection and turn failure into progress.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mx-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((failure) => {
          const date = new Date(failure.createdAt).toLocaleDateString()

          return (
            <div
              key={failure.id}
              className="group relative flex flex-col overflow-visible rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-lg"
            >
              <Link href={`/dashboard/${failure.id}`} className="flex flex-1 flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-orange-100 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
                      {failure.category?.name || "Uncategorized"}
                    </span>
                    {getAiStatusIcon(failure.aiStatus)}
                  </div>

                   <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {date}
                  </span>
                </div>

                <h2 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-slate-800 dark:text-slate-100 transition-colors duration-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  {failure.title}
                </h2>

                <p className="line-clamp-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {failure.description}
                </p>

                {failure.emotions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {failure.emotions.map((emotion) => (
                      <span
                        key={emotion?.id}
                        className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {emotion?.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-500 transition-colors duration-200 group-hover:text-orange-700 dark:group-hover:text-orange-400">
                    Read reflection →
                  </span>
                </div>
              </Link>

              {/* menu */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === failure.id ? null : failure.id)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm transition-all duration-200 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  <BsThreeDotsVertical size={16} />
                </button>

                {openMenu === failure.id && (
                  <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-20">
                    <Link
                      href={`/dashboard/edit/${failure.id}`}
                      className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => {
                        setDeleteId(failure.id)
                        setOpenMenu(null)
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Delete Failure</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this failure? This action cannot
                be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cardlist