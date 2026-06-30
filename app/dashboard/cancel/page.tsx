"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CancelPage() {
  const t = useTranslations("Checkout");

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {t("cancelTitle")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t("cancelDesc")}
        </p>
        <Link
          href="/subscription"
          className="block w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 rounded-2xl transition-all"
        >
          {t("cancelBtn")}
        </Link>
      </div>
    </main>
  );
}
