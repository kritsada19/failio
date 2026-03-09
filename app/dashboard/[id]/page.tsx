"use client"

import { useFetch } from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import { useState } from "react";
import FailureDetail from "@/components/dashboard/FailureDetail";
import axios from "axios";

interface FailureData {
    id: number;
    title: string;
    description: string;
    aiSuggestion: string | null;
    createdAt: Date;
    emotions: {
        id: number;
        name: string;
    }[];
    category: {
        id: number;
        name: string;
    };
}

function DetailFailurePage() {
    const params = useParams();
    const id = params.id;

    const { data: failure, loading, error, reFetch } =
        useFetch<FailureData>(`/api/failure/${id}`);

    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);

            await axios.post(`/api/failure/${id}/ai`);

            await reFetch();
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;
    if (!failure) return null;

    return (
        <FailureDetail
            failure={failure}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
        />
    );
}

export default DetailFailurePage;