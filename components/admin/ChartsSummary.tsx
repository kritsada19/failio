'use client';

import React, { useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import {
  TrendingUp,
  Users,
  Layers,
  Smile,
} from 'lucide-react';

interface User {
  id: string;
  createdAt: string;
}

interface UserResponse {
  users: User[];
  total: number;
}

interface StatItem {
  id: string;
  name: string;
  _count: {
    failures: number;
  };
}

export default function ChartsSummary() {
  const { data: userData, loading: userLoading } = useFetch<UserResponse>('/api/admin/user?new=true&limit=100');
  const { data: categories, loading: categoriesLoading } = useFetch<StatItem[]>('/api/admin/category?top=true&limit=5');
  const { data: emotions, loading: emotionsLoading } = useFetch<StatItem[]>('/api/admin/emotion?top=true&limit=5');

  const isLoading = userLoading || categoriesLoading || emotionsLoading;

  // Process data for charts
  const userGrowthData = useMemo(() => {
    if (!userData?.users) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const counts = last7Days.map(date => {
      const count = userData.users.filter(u => u.createdAt.split('T')[0] === date).length;
      return { date, count };
    });

    return counts;
  }, [userData]);

  const maxUserCount = Math.max(...userGrowthData.map(d => d.count), 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* New Users Growth Chart */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md p-8 transition-all hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-900/50">
        <div className="flex items-center justify-between mb-8">
          <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <Users size={24} />
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
            <TrendingUp size={14} />
            +{userData?.total}
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            New Users <span className="text-sm font-medium text-slate-500 font-mono">(Last 7 Days)</span>
          </h3>
          <p className="text-sm text-slate-500 font-medium">Growth interaction tracking</p>
        </div>

        <div className="h-40 flex items-end gap-2">
          {userGrowthData.map((d, index) => {
            const height = (d.count / maxUserCount) * 100;

            return (
              <div
                key={d.date}
                className="flex-1 h-full flex flex-col justify-end items-center gap-2 group/bar"
              >
                <div className="w-full h-32 flex items-end">
                  <div
                    className="w-full bg-orange-100 dark:bg-orange-900/20 rounded-t-xl relative overflow-hidden transition-all duration-700 ease-out"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-orange-500 to-orange-400" />

                    {d.count > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-600 dark:text-orange-400 opacity-0 group-hover/bar:opacity-100 transition-all">
                        {d.count}
                      </div>
                    )}
                  </div>
                </div>

                {/* label */}
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase">
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Categories Chart */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md p-8 transition-all hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900/50">
        <div className="flex items-center justify-between mb-8">
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Layers size={24} />
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Top Categories
          </h3>
          <p className="text-sm text-slate-500 font-medium">Most frequent failure types</p>
        </div>

        <div className="space-y-4">
          {categories?.map((cat, i) => {
            const maxVal = categories[0]?._count.failures || 1;
            const percentage = (cat._count.failures / maxVal) * 100;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                  <span className="text-xs font-mono font-bold text-blue-500">{cat._count.failures}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Emotions Chart */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md p-8 transition-all hover:shadow-2xl hover:border-pink-200 dark:hover:border-pink-900/50">
        <div className="flex items-center justify-between mb-8">
          <div className="p-3 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
            <Smile size={24} />
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Emotional Range
          </h3>
          <p className="text-sm text-slate-500 font-medium">Top picked failure feelings</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {emotions?.map((emo, i) => (
            <div
              key={emo.id}
              className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] hover:shadow-xl"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white text-center truncate w-full">{emo.name}</span>
              <div className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-black font-mono">
                {emo._count.failures}
              </div>
            </div>
          ))}
          {emotions && emotions.length < 4 && Array.from({ length: 4 - emotions.length }).map((_, i) => (
            <div key={i} className="p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <span className="text-slate-300 dark:text-slate-700 font-mono text-xs">EMPTY</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
