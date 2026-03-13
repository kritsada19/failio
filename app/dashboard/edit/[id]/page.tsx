"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

interface Failures {
  id: number;
  title: string;
  description: string;
  emotions: {
    id: number;
    name: string;
  }[];
  aiSuggestion: string | null;
  createdAt: Date;
  category: {
    id: number;
    name: string;
  };
}

interface Emotions {
  id: number;
  name: string;
}

interface Categorys {
  id: number;
  name: string;
}

function EditFailurePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [emotions, setEmotions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: failure } = useFetch<Failures>(`/api/failure/${id}`);
  const { data: emotionList } = useFetch<Emotions[]>("/api/emotion");
  const { data: categoryList } = useFetch<Categorys[]>("/api/category");

  useEffect(() => {
    if (failure) {
      setTitle(failure.title);
      setDescription(failure.description);
      setCategoryId(String(failure.category.id));
      setEmotions(failure.emotions.map((e) => e.id));
    }
  }, [failure]);

  const toggleEmotion = (id: number) => {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.put(`/api/failure/${id}`, {
        title,
        description,
        categoryId,
        emotions,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Update failure failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Failure</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
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

        <div>
          <p className="font-semibold mb-2">Emotions</p>

          <div className="flex gap-2 flex-wrap">
            {emotionList?.map((emotion) => (
              <button
                type="button"
                key={emotion.id}
                onClick={() => toggleEmotion(emotion.id)}
                className={`px-3 py-1 border rounded ${
                  emotions.includes(emotion.id)
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {emotion.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
}

export default EditFailurePage;