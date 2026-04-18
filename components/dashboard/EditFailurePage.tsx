"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateFailure, type FailureState } from "@/actions/failure";
import { toast } from "sonner";

interface Failure {
  id: number;
  title: string;
  description: string;
  emotions: {
    id: number;
    name: string;
  }[];
  aiSuggestion: string | null;
  createdAt: string | Date;
  category: {
    id: number;
    name: string;
  };
}

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
      className="rounded-2xl bg-slate-900 dark:bg-slate-100 px-5 py-3 text-sm font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Updating..." : "Update failure"}
    </button>
  );
}

export default function EditFailurePage({
  failure,
  emotionList,
  categoryList,
}: {
  failure: Failure;
  emotionList: Emotion[];
  categoryList: Category[];
}) {
  const router = useRouter();
  const id = failure.id;

  const [state, formAction] = useActionState(updateFailure, initialState);

  const [title, setTitle] = useState<string>(failure.title);
  const [description, setDescription] = useState<string>(failure.description);
  const [categoryId, setCategoryId] = useState<string>(String(failure.category.id));
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>(
    failure.emotions.map((e) => e.id)
  );

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

  const toggleEmotion = (id: number) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 transition-colors duration-500">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Failio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Edit your failure
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            ปรับแก้รายละเอียด เพื่อให้บทเรียนของคุณชัดเจนขึ้น
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-amber-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="id" value={id} />

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Title
              </label>
              <input
                name="title"
                type="text"
                placeholder="เช่น พูดในที่ประชุมแล้วลืมประเด็น"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {state.error?.title && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.title[0]}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Description
              </label>
              <textarea
                name="description"
                placeholder="เล่าว่าเกิดอะไรขึ้น คุณรู้สึกยังไง และคิดว่าพลาดตรงไหน..."
                className="min-h-40 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {state.error?.description && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.description[0]}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Category
              </label>
              <select
                name="categoryId"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
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

              {state.error?.categoryId && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.categoryId[0]}
                </p>
              )}
            </div>

            {/* Emotions */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
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
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-amber-400 dark:bg-amber-500 text-slate-900 shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                      }`}
                    >
                      {emotion.name}
                    </button>
                  );
                })}
              </div>

              {selectedEmotions.map((id) => (
                <input key={id} type="hidden" name="emotions" value={id} />
              ))}

              {state.error?.emotions && (
                <p className="mt-2 text-sm text-red-500">
                  {state.error.emotions[0]}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                เลือกอารมณ์ที่ยังสะท้อนความรู้สึกของเหตุการณ์นี้
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
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
