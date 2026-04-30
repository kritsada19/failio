"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Thank you for subscribing to Failio Pro. Your account has been upgraded and you now have access to all premium features.
        </p>
        <Link
          href="/dashboard"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
