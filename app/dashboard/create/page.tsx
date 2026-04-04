"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createFailure, type FailureState } from "@/actions/failure";
import { toast } from "sonner";

interface Emotion {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const initialState: FailureState = {
  success: false,
  message: "",
  error: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create failure"}
    </button>
  );
}

export default function CreateFailurePage() {
  const router = useRouter();
  const [state, formAction] = useActionState(createFailure, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } else {
      toast.error(state.message);
    }
  }, [state, router]);

  const { data: emotionList } = useFetch<Emotion[]>("/api/emotion");
  const { data: categoryList } = useFetch<Category[]>("/api/category");

  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);

  const toggleEmotion = (id: number) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
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

        {/* Global message */}
        {state.message && !state.success && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <form action={formAction} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="เช่น พูดในที่ประชุมแล้วลืมประเด็น"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              {state.error?.title && (
                <p className="mt-2 text-sm text-red-500">{state.error.title[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Description
              </label>
              <textarea
                name="description"
                placeholder="เล่าว่าเกิดอะไรขึ้น คุณรู้สึกยังไง และคิดว่าพลาดตรงไหน..."
                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                rows={6}
              />
              {state.error?.description && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.description[0]}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Category
              </label>
              <select
                name="categoryId"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              >
                <option value="">Select category</option>
                {categoryList?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {state.error?.categoryId && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.categoryId[0]}
                </p>
              )}
            </div>

            {/* Emotions */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-800">
                Emotions
              </label>

              <div className="flex flex-wrap gap-2">
                {emotionList?.map((emotion) => {
                  const active = selectedEmotions.includes(emotion.id);

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

              {/* hidden inputs สำหรับส่ง array เข้า server action */}
              {selectedEmotions.map((id) => (
                <input key={id} type="hidden" name="emotions" value={id} />
              ))}

              {state.error?.emotions && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.emotions[0]}
                </p>
              )}

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

              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}