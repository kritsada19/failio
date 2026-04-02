'use client';

import React from 'react';
import { Users, ClipboardList, Zap } from 'lucide-react';

interface KPIStatsProps {
  totalUsers: number;
  totalFailures: number;
  failuresToday: number;
  isLoading: boolean;
}

export default function KPIStats({ totalUsers, totalFailures, failuresToday, isLoading }: KPIStatsProps) {
  const stats = [
    {
      label: 'TOTAL USERS',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-100/50 dark:border-blue-900/20',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
      description: 'Active accounts grow'
    },
    {
      label: 'FAILURES LOGGED',
      value: totalFailures,
      icon: ClipboardList,
      color: 'from-orange-500/10 to-transparent',
      borderColor: 'border-orange-100/50 dark:border-orange-900/20',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
      description: 'Total analysis records'
    },
    {
      label: 'TODAY\'S ACTIVITY',
      value: failuresToday,
      icon: Zap,
      color: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-100/50 dark:border-purple-900/20',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
      description: 'New insights today'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`relative group overflow-hidden rounded-3xl border ${stat.borderColor} bg-white dark:bg-slate-900 p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1.5`}
        >
          {/* Decorative Gradient Overlay */}
          <div className={`absolute inset-0 bg-linear-to-br ${stat.color} pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`} />

          <div className="relative flex flex-col gap-5">
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                {stat.label}
              </p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isLoading ? (
                  <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                ) : (
                  stat.value.toLocaleString()
                )}
              </h3>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${stat.iconColor.replace('text-', 'bg-')} animate-pulse`} />
                {stat.description}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
