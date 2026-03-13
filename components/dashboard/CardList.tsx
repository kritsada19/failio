"use client"

import Link from "next/link"
import { useState } from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import axios from "axios"

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
  category: { id: number; name: string }
  emotions: { id: number; name: string }[]
}

function Cardlist({ data, loading, error }: CardListProps) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await axios.delete(`/api/failure/${deleteId}`)
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return <p className="text-center py-10">Loading...</p>
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>
  }

  if (data.length === 0) {
    return <p className="text-center py-10 text-gray-500">No failures yet</p>
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-10">
        {data.map((failure) => {
          const date = new Date(failure.createdAt).toLocaleDateString()

          return (
            <div
              key={failure.id}
              className="relative bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col"
            >
              <Link href={`/dashboard/${failure.id}`} className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                    {failure.category.name}
                  </span>

                  <span className="text-xs text-gray-500">{date}</span>
                </div>

                <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                  {failure.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-4 flex-1">
                  {failure.description}
                </p>

                {failure.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {failure.emotions.map((emotion) => (
                      <span
                        key={emotion.id}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-md"
                      >
                        {emotion.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              {/* menu */}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === failure.id ? null : failure.id)
                  }
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <BsThreeDotsVertical size={18} />
                </button>

                {openMenu === failure.id && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-md">
                    <Link
                      href={`/dashboard/edit/${failure.id}`}
                      className="block px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => {
                        setDeleteId(failure.id)
                        setOpenMenu(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Delete Failure</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this failure?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
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