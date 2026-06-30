"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

function CheckEmail() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-950 px-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <MailCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-3">
          Check Your Email
        </h1>

        <p className="text-gray-600 dark:text-slate-400 leading-7 mb-2">
          We’ve sent a verification link to{" "}
          <span className="font-semibold text-gray-800 dark:text-slate-200">
            {email || "your email address"}
          </span>
          .
        </p>

        <p className="text-gray-600 dark:text-slate-400 leading-7 mb-4">
          Please open your inbox and click{" "}
          <span className="font-semibold text-gray-800 dark:text-slate-200">Verify Email</span>{" "}
          to activate your Failio account.
        </p>

        <p className="text-sm text-gray-500 dark:text-slate-500 mb-6">
          If you don’t see the email, please check your spam or promotions
          folder.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full bg-black dark:bg-slate-100 text-white dark:text-slate-900 py-2.5 rounded-lg hover:opacity-90 dark:hover:bg-white transition"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}

export default CheckEmail;