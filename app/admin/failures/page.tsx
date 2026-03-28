'use client';

import React, { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import {
  Activity,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

interface Failure {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  category: { name: string } | null;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  emotions: { name: string }[];
  aiStatus: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  aiResult: {
    summary?: string;
    rootCause?: string;
    suggestions?: string[];
    lesson?: string;
  } | null;
  aiAnalyzedAt: string | null;
}

interface FailuresResponse {
  failures: Failure[];
  total: number;
  pagination: {
    page: number;
    totalPages: number;
    limit: number;
  };
}

export default function FailureManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, reFetch } = useFetch<FailuresResponse>(
    `/api/admin/failure?page=${page}&limit=10&search=${debouncedSearch}`
  );

  const [selectedFailure, setSelectedFailure] = useState<Failure | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this failure report? This cannot be undone.')) return;

    try {
      await axios.delete(`/api/admin/failure/${id}`);
      reFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete failure report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'PROCESSING': return <Clock size={14} className="text-orange-500 animate-pulse" />;
      case 'FAILED': return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'ANALYZED';
      case 'PROCESSING': return 'PROCESSING';
      case 'FAILED': return 'AI ERROR';
      default: return 'PENDING AI';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Portal Core
            </Link>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldAlert size={14} />
                Platform Supervision
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Failure <span className="text-orange-500">Logs.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Monitor and moderate user reports of failure and regret.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{data?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, user, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 size={40} className="animate-spin text-orange-500" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Retrieving Logs...</p>
              </div>
            ) : error ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle size={24} />
                </div>
                <p className="text-slate-900 dark:text-white font-bold">Failed to load reports</p>
                <button onClick={() => reFetch()} className="text-orange-500 font-bold hover:underline">Try Again</button>
              </div>
            ) : !data || data.failures.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-medium text-lg italic">No failures found matching your search.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Failure Info</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category & Emotions</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">User</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.failures.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-8 py-5 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-400 line-clamp-1 font-medium italic">
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tight">
                            {item.category?.name || 'No CATEGORY'}
                          </span>
                          {item.emotions.slice(0, 2).map((emo, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-tight">
                              {emo.name}
                            </span>
                          ))}
                          {item.emotions.length > 2 && (
                            <span className="text-[10px] font-bold text-slate-400">+{item.emotions.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.aiStatus)}
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                            {getStatusText(item.aiStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {item.user.image ? (
                            <Image src={item.user.image} width={24} height={24} className="rounded-full bg-slate-100" alt="" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <User size={12} className="text-slate-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {item.user.name || 'Anonymous'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button
                            onClick={() => setSelectedFailure(item)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90 transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 active:scale-90 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Page {page} of {data.pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(data.pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${page === i + 1
                        ? 'bg-orange-500 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                        }`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 3), Math.min(data.pagination.totalPages, page + 2))}
                </div>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Overlay / Modal */}
      {selectedFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedFailure(null)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="h-40 bg-orange-500 relative flex items-center justify-center overflow-hidden">
              <Activity className="text-white/20 absolute -right-4 -bottom-4 rotate-12" size={200} />
              <div className="relative z-10 text-center space-y-2 px-8">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">REPORT ARCHIVE</span>
                <h2 className="text-3xl font-black text-white line-clamp-1">{selectedFailure.title}</h2>
              </div>
              <button
                onClick={() => setSelectedFailure(null)}
                className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column - Core Info */}
              <div className="lg:col-span-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 space-y-8">
                    {/* Summary Section */}
                    <div className="space-y-4">
                      <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/70 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full">
                        <Info size={12} />
                        User Context
                      </label>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold text-lg bg-slate-50 dark:bg-slate-950/30 p-8 rounded-4xl border border-slate-100 dark:border-slate-800">
                        &quot;{selectedFailure.description}&quot;
                      </p>
                    </div>

                    {/* AI Analysis Section */}
                    {selectedFailure.aiStatus === 'COMPLETED' && selectedFailure.aiResult && (
                      <div className="space-y-6">
                        <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                          <Zap size={12} />
                          AI Insight Analysis
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Target size={18} />
                              <span className="text-sm font-black uppercase tracking-tight">Root Cause</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {selectedFailure.aiResult.rootCause}
                            </p>
                          </div>
                          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20 space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <BookOpen size={18} />
                              <span className="text-sm font-black uppercase tracking-tight">Key Lesson</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {selectedFailure.aiResult.lesson}
                            </p>
                          </div>
                        </div>

                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-4xl border border-indigo-100 dark:border-indigo-900/20 space-y-4">
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Lightbulb size={20} />
                            <span className="text-base font-black uppercase tracking-tight">Growth Suggestions</span>
                          </div>
                          <ul className="space-y-3">
                            {selectedFailure.aiResult.suggestions?.map((item, idx) => (
                              <li key={idx} className="flex gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black">
                                  {idx + 1}
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedFailure.aiStatus === 'PROCESSING' && (
                      <div className="bg-orange-50/50 dark:bg-orange-900/10 p-12 rounded-4xl border border-orange-100 dark:border-orange-900/20 flex flex-col items-center justify-center text-center gap-4">
                        <Loader2 size={32} className="animate-spin text-orange-500" />
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Processing</p>
                          <p className="text-sm font-bold text-slate-500">AI is currently extracting wisdom from this failure...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 space-y-8">
                    {/* Reporter Section */}
                    <div className="p-6 rounded-4xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archived By</label>
                        <div className="flex items-center gap-4">
                          {selectedFailure.user.image ? (
                            <Image src={selectedFailure.user.image} width={40} height={40} className="rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                              <User size={20} className="text-orange-500" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{selectedFailure.user.name || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">{selectedFailure.user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library Path</label>
                          <p className="text-sm font-black text-orange-500 uppercase">{selectedFailure.category?.name || 'Unmapped'}</p>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emotional Resonance</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedFailure.emotions.map((emo, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-xl bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-tight">
                                {emo.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-6 rounded-4xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Moderation Tools</p>
                      <button
                        onClick={() => {
                          handleDelete(selectedFailure.id);
                          setSelectedFailure(null);
                        }}
                        className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Purge Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry ID</span>
                  <span className="text-sm font-mono font-bold text-slate-600">#FAIL-{selectedFailure.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded On</span>
                  <span className="text-sm font-bold text-slate-600">{new Date(selectedFailure.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFailure(null)}
                className="px-12 py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Return to Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
