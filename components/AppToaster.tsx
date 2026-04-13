"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AppToaster() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Toaster
            position="top-right"
            theme={resolvedTheme as "light" | "dark"}
            richColors
            closeButton
            duration={5000}
        />
    );
}