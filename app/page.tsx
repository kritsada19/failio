"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {

  // useTranslations() คือ hook ของ next-intl ที่ใช้สำหรับดึงข้อความจากไฟล์ JSON
  // 'Home' คือชื่อของ key ในไฟล์ JSON
  const t = useTranslations('Home');
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const features = [
    {
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      icon: "📝",
    },
    {
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      icon: "🤖",
    },
    {
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      icon: "📈",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-b from-white via-slate-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_30%),radial-gradient(circle_at_left,rgba(30,41,59,0.06),transparent_20%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 sm:py-14 lg:py-20">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Image
              src={isDark ? "/logo-nav-dark.png" : "/logo-nav.png"}
              alt="Failio Logo"
              width={340}
              height={120}
              className="h-auto w-55 sm:w-70 lg:w-85"
              priority
            />
          </div>

          <div className="mt-4 grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-900/50 bg-orange-100 dark:bg-orange-900/20 px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                <span>✨</span>
                {t('heroTag')}
              </div>

              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {t('heroTitle1')} <span className="text-orange-700">{t('heroTitleHighlight')}</span>
                <span className="block text-slate-700 dark:text-slate-300">{t('heroTitle2')}</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                {t('heroDesc')}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href='/dashboard' className="rounded-2xl bg-slate-900 dark:bg-slate-100 px-6 py-3 text-base font-semibold text-white dark:text-slate-900 shadow-lg transition hover:bg-slate-800 dark:hover:bg-white">
                  {t('startLoggingBtn')}
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-4xl bg-orange-200/40 blur-3xl" />
              <div className="relative rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('sampleLog')}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t('sampleTitle')}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                    {t('demoBadge')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('whatHappened')}</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      {t('whatHappenedDesc')}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-4">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">{t('aiSuggestion')}</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      {t('aiSuggestionDesc')}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('rootCause')}</p>
                      <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">{t('rootCauseDesc')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('lessonsLearned')}</p>
                      <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">{t('lessonsLearnedDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-500">{t('featuresTag')}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {t('featuresTitle')}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t('featuresDesc')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 dark:bg-orange-900/30 text-2xl ring-1 ring-orange-200 dark:ring-orange-800/50">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2.5rem] border border-orange-200 dark:border-slate-800 bg-linear-to-r from-orange-50 to-white dark:from-slate-900 dark:to-slate-800 p-8 shadow-xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-500">{t('ctaTag')}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                {t('ctaTitle')}
                <span className="block">{t('ctaTitle2')}</span>
              </h2>
              <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">
                {t('ctaDesc')}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link href='/sign-up' className="rounded-2xl bg-slate-900 dark:bg-slate-100 px-6 py-3 text-base font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white">
                {t('startLoggingBtn')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
