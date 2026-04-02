'use client';

import React, { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Mail,
  Calendar,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Cpu,
  Tag,
  Heart,
  FileText,
  KeyRound,
  MoreVertical,
  ShieldAlert,
  Activity,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Account {
  provider: string;
  type: string;
}

interface Failure {
  id: number;
  title: string;
  description: string;
  aiStatus: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  category: { id: number; name: string } | null;
  emotions: { id: number; name: string }[];
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Account[];
  failures: Failure[];
  _count: {
    failures: number;
    accounts: number;
  };
}

const AI_STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icon: MoreVertical },
  PROCESSING: { label: 'Processing', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', icon: Cpu },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const PROVIDER_COLORS: Record<string, string> = {
  google: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  github: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  credentials: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
};

function StatCard({ label, value, icon: Icon, accent = 'blue' }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const accentMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accentMap[accent]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, loading, error, reFetch } = useFetch<UserDetail>(
    userId ? `/api/admin/user/${userId}` : null
  );

  const [updatingRole, setUpdatingRole] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdateRole = async () => {
    if (!user) return;
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    setUpdatingRole(true);
    try {
      await axios.patch(`/api/admin/user/${userId}`, { role: newRole });
      reFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/user/${userId}`);
      router.push('/admin/users');
    } catch (err: unknown) {
      setDeleting(false);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Failed to delete user');
      } else {
        alert('Failed to delete user');
      }
    }
  };

  const aiStats = user ? {
    completed: user.failures.filter(f => f.aiStatus === 'COMPLETED').length,
    processing: user.failures.filter(f => f.aiStatus === 'PROCESSING').length,
    failed: user.failures.filter(f => f.aiStatus === 'FAILED').length,
  } : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/40 via-transparent to-indigo-50/20 dark:from-blue-950/10 dark:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/admin/users" className="flex items-center gap-1.5 hover:text-blue-500 transition-colors font-medium">
            <ArrowLeft size={15} />
            User Base
          </Link>
          <ChevronRight size={14} className="opacity-40" />
          <span className="text-slate-600 dark:text-slate-300 font-bold truncate max-w-[200px]">
            {loading ? '...' : (user?.name || user?.email || 'User Detail')}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading identity record...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">Failed to load user</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
            <button onClick={() => reFetch()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95">
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && user && (
          <div className="space-y-6">

            {/* Hero Profile Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
              {/* Banner */}
              <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full border border-white/30"
                      style={{
                        width: `${80 + i * 60}px`, height: `${80 + i * 60}px`,
                        top: `${-20 + i * 5}px`, right: `${-20 + i * 10}px`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Profile info */}
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-10 mb-6">
                  {/* Avatar */}
                  <div className="relative w-20 h-20 shrink-0 ring-4 ring-white dark:ring-slate-950 rounded-[1.25rem] overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 shadow-xl">
                    {user.image ? (
                      <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-3xl">
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 md:mb-0">
                    <button
                      onClick={handleUpdateRole}
                      disabled={updatingRole}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tight transition-all active:scale-95 border disabled:opacity-60 ${user.role === 'ADMIN'
                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                    >
                      {updatingRole ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : user.role === 'ADMIN' ? (
                        <ShieldCheck size={13} />
                      ) : (
                        <Users size={13} />
                      )}
                      {updatingRole ? 'Updating...' : (user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin')}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tight bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-all active:scale-95 disabled:opacity-60"
                    >
                      {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      {deleting ? 'Deleting...' : 'Delete User'}
                    </button>
                  </div>
                </div>

                {/* Name / Role badge */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    {user.name || 'Anonymous User'}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN'
                    ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                    {user.role === 'ADMIN' ? <ShieldAlert size={10} /> : <Users size={10} />}
                    {user.role}
                  </span>
                </div>

                {/* Meta info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <CheckCircle2 size={14} className={user.emailVerified ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className="font-medium">
                      {user.emailVerified ? 'Email Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium">
                      Updated {new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Auth providers */}
                {user.accounts.length > 0 && (
                  <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <KeyRound size={13} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Auth via</span>
                    {user.accounts.map((acc, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide border capitalize ${PROVIDER_COLORS[acc.provider] || PROVIDER_COLORS.credentials}`}>
                        {acc.provider}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Failures" value={user._count.failures} icon={FileText} accent="blue" />
              <StatCard label="AI Completed" value={aiStats?.completed ?? 0} icon={CheckCircle2} accent="emerald" />
              <StatCard label="AI Processing" value={aiStats?.processing ?? 0} icon={Activity} accent="amber" />
              <StatCard label="Auth Providers" value={user._count.accounts} icon={KeyRound} accent="purple" />
            </div>

            {/* Failure History */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Recent Failures</h2>
                    <p className="text-xs text-slate-400 font-medium">Last {user.failures.length} entries</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                  {user._count.failures} total
                </span>
              </div>

              {user.failures.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={24} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No failures recorded</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/80">
                  {user.failures.map((failure) => {
                    const status = AI_STATUS_CONFIG[failure.aiStatus];
                    const StatusIcon = status.icon;
                    return (
                      <div key={failure.id} className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-500 transition-colors truncate">
                                {failure.title}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${status.color}`}>
                                <StatusIcon size={9} />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-3">
                              {failure.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {failure.category && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                  <Tag size={9} />
                                  {failure.category.name}
                                </span>
                              )}
                              {failure.emotions.slice(0, 3).map(em => (
                                <span key={em.id} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[10px] font-bold border border-pink-100 dark:border-pink-800">
                                  <Heart size={9} />
                                  {em.name}
                                </span>
                              ))}
                              {failure.emotions.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400">+{failure.emotions.length - 3} more</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                              {new Date(failure.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-medium text-slate-300 dark:text-slate-600 font-mono">
                              #{failure.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User ID / Raw Info */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System ID</p>
              <p className="font-mono text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl break-all">
                {user.id}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
