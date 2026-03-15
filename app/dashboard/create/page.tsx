"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Emotions {
  id: number;
  name: string;
}

interface Categorys {
  id: number;
  name: string;
}

export default function CreateFailurePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [emotions, setEmotions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: emotionList } = useFetch<Emotions[]>("/api/emotion");
  const { data: categoryList } = useFetch<Categorys[]>("/api/category");

  const toggleEmotion = (id: number) => {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("/api/failure", {
        title,
        description,
        categoryId,
        emotions,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Create failure failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-amber-600">Failio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Create a new failure
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            บันทึกความผิดพลาดของวันนี้ แล้วเปลี่ยนมันให้เป็นบทเรียน
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Title
              </label>
              <input
                type="text"
                placeholder="เช่น พูดในที่ประชุมแล้วลืมประเด็น"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Description
              </label>
              <textarea
                placeholder="เล่าว่าเกิดอะไรขึ้น คุณรู้สึกยังไง และคิดว่าพลาดตรงไหน..."
                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Category
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categoryList?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Emotions */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-800">
                Emotions
              </label>

              <div className="flex flex-wrap gap-2">
                {emotionList?.map((emotion) => {
                  const active = emotions.includes(emotion.id);

                  return (
                    <button
                      type="button"
                      key={emotion.id}
                      onClick={() => toggleEmotion(emotion.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${active
                          ? "bg-amber-400 text-slate-900 shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                        }`}
                    >
                      {emotion.name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                เลือกอารมณ์ที่ตรงกับสิ่งที่คุณรู้สึกตอนเกิดเหตุการณ์
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create failure"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}