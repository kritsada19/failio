"use client";

import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type SignUpState } from "@/actions/auth/sign-up";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

const initialState: SignUpState = {
    success: false,
    message: "",
    email: "",
    error: {},
}

function SignUpButton() {
    const { pending } = useFormStatus();
    const t = useTranslations('Auth');
    return (
        <button
            type="submit"
            disabled={pending}
            className={`mt-6 w-full rounded-2xl bg-slate-900 dark:bg-slate-100 py-3 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white ${pending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
            {pending ? t('creatingAccount') : t('signUpBtn')}
        </button>
    );
}

export default function SignUp() {
    const [state, formAction] = useActionState(signUpAction, initialState);
    const router = useRouter();
    const t = useTranslations('Auth');

    useEffect(() => {
        if (state.success) {
            router.push(`/check-email?email=${state.email}`);
        }
    }, [state.success, state.email, router]);

    return (
        <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-10 transition-colors duration-500">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
                <form
                    action={formAction}
                    className="w-full rounded-3xl border border-amber-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-sm backdrop-blur"
                >
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Failio</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {t('signUpTitle')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('signUpDesc')}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {t('nameLabel')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder={t('namePlaceholder')}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
                            />
                            {state.error?.name && (
                                <p className="text-sm text-red-600">{state.error.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {t('emailLabel')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder={t('emailPlaceholder')}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
                            />
                            {state.error?.email && (
                                <p className="text-sm text-red-600">{state.error.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {t('passwordLabel')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder={t('passwordPlaceholder')}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
                            />
                            {state.error?.password && (
                                <p className="text-sm text-red-600">{state.error.password[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {t('confirmPasswordLabel')}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder={t('passwordPlaceholder')}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
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
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="px-3 text-sm text-slate-400 dark:text-slate-500">{t('orContinueWith')}</span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    {/* OAuth */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                        >
                            <FaGoogle size={18} />
                            {t('continueWithGoogle')}
                        </button>

                        <button
                            type="button"
                            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                        >
                            <FaFacebook size={18} />
                            {t('continueWithFacebook')}
                        </button>

                        <button
                            type="button"
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                        >
                            <FaGithub size={18} />
                            {t('continueWithGithub')}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('alreadyHaveAccount')}{" "}
                            <Link
                                href="/sign-in"
                                className="font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
                            >
                                {t('signInLink')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}