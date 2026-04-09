'use client';

import React from 'react';
import { useFetch } from '@/hooks/useFetch';
import GrowthCharts from '@/components/dashboard/GrowthCharts';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AnalyticsData {
  totalFailures: number;
  totalAnalyzed: number;
  topCategories: { id: number; name: string; count: number }[];
  emotions: { id: number; name: string; count: number }[];
  trend: { date: string; count: number }[];
}

export default function AnalyticsDashboardPage() {
  const { data, loading, error } = useFetch<AnalyticsData>('/api/me/analytics');
  const t = useTranslations('Analytics');

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest group"
            >
              ← {t('backBtn')}
            </Link>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
                ✨ {t('tag')}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                {t('title')}<span className="text-orange-500">{t('titleHighlight')}</span>
              </h1>
              <p className="text-lg text-slate-600 font-medium max-w-2xl">
                 {t('desc')}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-4xl border border-red-100 bg-white p-12 text-center text-red-500">
            {error}
          </div>
        ) : (
          <GrowthCharts data={data} loading={loading} />
        )}

        {/* Action Call for Growth */}
        {!loading && data && data.totalFailures > 0 && (
          <div className="mt-12 rounded-[2.5rem] border border-orange-200 bg-linear-to-r from-orange-50 to-white p-10 text-center shadow-sm">
            <h4 className="text-2xl font-bold text-slate-800 italic">{t('growthQuote')}</h4>
            <div className="mt-6 flex justify-center">
              <Link 
                href="/dashboard/create" 
                className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800"
              >
                {t('logNewBtn')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
