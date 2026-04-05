"use client";

import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type SignUpState } from "@/actions/auth/sign-up";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const initialState: SignUpState = {
    success: false,
    message: "",
    email: "",
    error: {},
}

function SignUpButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? "Creating account..." : "Sign Up"}
        </button>
    );
}

export default function SignUp() {
    const [state, formAction] = useActionState(signUpAction, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(`/check-email?email=${state.email}`);
        }
    }, [state.success, state.email, router]);

    return (
        <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 px-4 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
                <form
                    action={formAction}
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
                                name="name"
                                required
                                placeholder="Your name"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                            {state.error?.name && (
                                <p className="text-sm text-red-600">{state.error.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                            {state.error?.email && (
                                <p className="text-sm text-red-600">{state.error.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                            {state.error?.password && (
                                <p className="text-sm text-red-600">{state.error.password[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                            />
                            {state.error?.confirmPassword && (
                                <p className="text-sm text-red-600">{state.error.confirmPassword[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <SignUpButton />

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