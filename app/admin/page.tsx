'use client';

import React from 'react';
import KPIStats from '@/components/admin/KPIStats';
import ChartsSummary from '@/components/admin/ChartsSummary';
import { useFetch } from '@/hooks/useFetch';
import { ShieldAlert, Users2, Activity, ChevronRight, Heart, Box } from 'lucide-react';
import Link from 'next/link';

interface AdminStatsResponse {
  total: number;
}

interface Failure {
  id: string;
  title: string;
  category: { name: string } | null;
  createdAt: string;
  aiAnalyzedAt: string | null;
}

interface RecentFailuresResponse {
  failures: Failure[];
}

export default function AdminDashboard() {
  const { data: usersData, loading: usersLoading } = useFetch<AdminStatsResponse>('/api/admin/user?limit=1');
  const { data: failuresData, loading: failuresLoading } = useFetch<AdminStatsResponse>('/api/admin/failure?limit=1');
  const { data: failuresTodayData, loading: failuresTodayLoading } = useFetch<AdminStatsResponse>('/api/admin/failure?today=true&limit=1');
  const { data: recentFailuresData, loading: recentFailuresLoading } = useFetch<RecentFailuresResponse>('/api/admin/failure?limit=5');

  const isLoading = usersLoading || failuresLoading || failuresTodayLoading;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert size={14} />
              Admin Access Only
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Insight <span className="text-orange-500">Dashboard.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              Monitor, moderate, and manage your platform&apos;s growth.
            </p>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <KPIStats
            totalUsers={usersData?.total ?? 0}
            totalFailures={failuresData?.total ?? 0}
            failuresToday={failuresTodayData?.total ?? 0}
            isLoading={isLoading}
          />
        </section>

        {/* Charts and Summary Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <ChartsSummary />
        </section>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Management Entry Card */}
          <Link href="/admin/users" className="group overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900/50">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Base</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-xs">
                    Moderate users and roles.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-blue-600 font-bold text-xs tracking-wide">
                MANAGE <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Failure Log Entry Card */}
          <Link href="/admin/failures" className="group overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-900/50">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Logs</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-xs">
                    Track AI failure reports.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-orange-600 font-bold text-xs tracking-wide">
                ANALYZE <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Category Management Card */}
          <Link href="/admin/categories" className="group overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-900/50">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Box size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-xs">
                    Organize failure themes.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs tracking-wide">
                ORGANIZE <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Emotion Management Card */}
          <Link href="/admin/emotions" className="group overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 hover:border-pink-200 dark:hover:border-pink-900/50">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Heart size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emotions</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-xs">
                    Manage sentiment library.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-pink-600 font-bold text-xs tracking-wide">
                CURATE <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Failures Table Section */}
        <section className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity Feed</h3>
                <p className="text-sm text-slate-500 font-medium">Monitoring the latest reports across the platform.</p>
              </div>
              <Link 
                href="/admin/failures" 
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all"
              >
                View Full Logs
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {recentFailuresLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-400 font-mono">RETRIEVING LATEST INTEL...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Failure Title</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentFailuresData?.failures.map((f) => (
                      <tr key={f.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">
                              {f.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tight">
                            {f.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${f.aiAnalyzedAt ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 animate-pulse'}`} />
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {f.aiAnalyzedAt ? 'AI ANALYZED' : 'PENDING'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(f.createdAt).toLocaleString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!recentFailuresData?.failures || recentFailuresData.failures.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                          No recent failures found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}