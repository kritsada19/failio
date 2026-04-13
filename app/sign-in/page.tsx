"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Auth');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      const session = await getSession();

      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-10 transition-colors duration-500">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl border border-amber-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-sm backdrop-blur"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Failio</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t('signInTitle')}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t('signInDesc')}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('passwordLabel')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('passwordPlaceholder')}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Forgot Password */}
          <div className="mt-4 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-2xl bg-slate-900 dark:bg-slate-100 py-3 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {loading ? t('signingIn') : t('signInBtn')}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="px-3 text-sm text-slate-400 dark:text-slate-500">{t('orContinueWith')}</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* OAuth Buttons */}
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
              {t('noAccount')}{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
              >
                {t('signUpLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}