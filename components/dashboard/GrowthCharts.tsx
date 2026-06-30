'use client';

import React from 'react';
import {
  Layers,
  Smile,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AnalyticsData {
  totalFailures: number;
  totalAnalyzed: number;
  topCategories: { id: number; name: string; count: number }[];
  emotions: { id: number; name: string; count: number }[];
}

export default function GrowthCharts({ data, loading }: { data: AnalyticsData | null, loading: boolean }) {
  const t = useTranslations('Analytics');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Activity size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('totalFailures')}</span>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{data.totalFailures}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('totalFailuresNote')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Zap size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('wisdomGained')}</span>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{data.totalAnalyzed}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('wisdomNote')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:col-span-2 lg:col-span-1 transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Target size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('successRate')}</span>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {data.totalFailures > 0 ? Math.round((data.totalAnalyzed / data.totalFailures) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('successRateNote')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('recurringThemes')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('recurringThemesDesc')}</p>
            </div>
          </div>

          {data.topCategories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm italic">
              {t('noCategories')}
            </div>
          ) : (
            <div className="space-y-5">
              {data.topCategories.map((cat, i) => {
                const percentage = (cat.count / data.topCategories[0].count) * 100;
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>{cat.name}</span>
                      <span className="font-mono text-indigo-500 dark:text-indigo-400">{cat.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emotions Cloud/Grid */}
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              <Smile size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('emotionalLandscape')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('emotionalLandscapeDesc')}</p>
            </div>
          </div>

          {data.emotions.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-300 text-sm italic">
               {t('noEmotions')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data.emotions.map((emo) => {
                const totalEmotionsCount = data.emotions.reduce((acc, curr) => acc + curr.count, 0);
                const intensity = (emo.count / totalEmotionsCount) * 100;
                return (
                  <div 
                    key={emo.id} 
                    className="p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300"
                  >
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">{emo.name}</span>
                    <div className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-900/50 text-pink-600 dark:text-pink-400 text-[10px] font-black font-mono">
                      {Math.round(intensity)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
