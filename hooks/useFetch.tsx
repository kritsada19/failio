import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    reFetch: () => Promise<void>;
}


export function useFetch<T>(url: string | null): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        if (!url) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<T>(url);
            setData(response.data);
        } catch (err: unknown) {
            setData(null);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, reFetch: fetchData };
}