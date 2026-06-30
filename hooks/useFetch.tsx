import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface FetchOptions {
    refreshInterval?: number;
}

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    reFetch: (isSilent?: boolean) => Promise<void>;
}


export function useFetch<T>(url: string | null, options?: FetchOptions): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isSilent: boolean = false): Promise<void> => {
        if (!url) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        if (!isSilent) {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await axios.get<T>(url);
            setData(response.data);
        } catch (err: unknown) {
            // Only set data to null if not silient, or keep old data on error during silent fetch
            if (!isSilent) {
                setData(null);
            }
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            if (!isSilent) {
                setLoading(false);
            }
        }
    }, [url]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (options?.refreshInterval && url) {
            const interval = setInterval(() => {
                fetchData(true);
            }, options.refreshInterval);
            return () => clearInterval(interval);
        }
    }, [options?.refreshInterval, url, fetchData]);

    return { data, loading, error, reFetch: fetchData };
}