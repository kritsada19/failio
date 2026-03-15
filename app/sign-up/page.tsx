"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import axios from "axios";
import Link from "next/link";

export default function SignUp() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (loading) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post("/api/auth/sign-up", {
                name: name.trim(),
                email: email.trim(),
                password,
                confirmPassword,
            });

            if (response.status === 201) {
                router.push(`/check-email?email=${email.trim()}`);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const data = err.response?.data;
                const message =
                    data &&
                        typeof data === "object" &&
                        "message" in data &&
                        typeof (data as { message?: unknown }).message === "string"
                        ? (data as { message?: string }).message
                        : undefined;

                if (status === 409) {
                    setError(message || "Email already exists.");
                    return;
                }

                if (status === 400) {
                    setError(message || "Invalid input.");
                    return;
                }

                setError(message || "Something went wrong. Please try again.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 px-4 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="w-full rounded-3xl border border-amber-100 bg-white/90 p-8 shadow-sm backdrop-blur"
                >
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <p className="text-sm font-medium text-amber-600">Failio</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Start recording failures and turn them into growth.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Your name"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="px-3 text-sm text-slate-400">or continue with</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* OAuth */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                            <FaGoogle size={18} />
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                            <FaFacebook size={18} />
                            Continue with Facebook
                        </button>

                        <button
                            type="button"
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                            <FaGithub size={18} />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                href="/sign-in"
                                className="font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}