"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="
        relative flex items-center justify-center
        w-10 h-10 rounded-xl
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        transition-all duration-300
        shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
        active:scale-95
      "
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <Sun
                    className={`
                        absolute inset-0 w-full h-full text-yellow-500 
                        transition-all duration-500 ease-spring
                        ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
                    `}
                />
                <Moon
                    className={`
                        absolute inset-0 w-full h-full text-blue-400 
                        transition-all duration-500 ease-spring
                        ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
                    `}
                />
            </div>
        </button>
    );
}