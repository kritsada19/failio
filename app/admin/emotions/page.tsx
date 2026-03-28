'use client';

import React, { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { 
  Heart, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  Loader2,
  Activity,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Emotion {
  id: number;
  name: string;
  _count?: {
    failures: number;
  };
}

export default function EmotionManagement() {
  const { data: emotions, loading, error, reFetch } = useFetch<Emotion[]>('/api/admin/emotion');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmotion, setEditingEmotion] = useState<Emotion | null>(null);
  const [emotionName, setEmotionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const filteredEmotions = emotions?.filter(emo => 
    emo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleOpenModal = (emotion?: Emotion) => {
    if (emotion) {
      setEditingEmotion(emotion);
      setEmotionName(emotion.name);
    } else {
      setEditingEmotion(null);
      setEmotionName('');
    }
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmotion(null);
    setEmotionName('');
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotionName.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (editingEmotion) {
        await axios.patch(`/api/admin/emotion/${editingEmotion.id}`, { name: emotionName });
      } else {
        await axios.post('/api/admin/emotion', { name: emotionName });
      }
      handleCloseModal();
      reFetch();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message || 'Something went wrong');
      } else {
        setSubmitError('Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this emotion? It will be removed from all associated failure reports.')) return;

    try {
      await axios.delete(`/api/admin/emotion/${id}`);
      reFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete emotion');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 selection:bg-pink-100 selection:text-pink-900 transition-colors duration-300">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-pink-500 transition-colors uppercase tracking-widest group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Portal Core
            </Link>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Sentiment Library
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Failure <span className="text-pink-500">Emotions.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Manage the spectrum of feelings associated with failure reports.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/20 active:scale-95 transition-all"
          >
            <Plus size={20} />
            Add Emotion
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Heart size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Emotions</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{emotions?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Emotional Range</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">Diverse</p>
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
                placeholder="Search emotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Sort by:</span>
              <select className="bg-transparent border-none text-xs font-black uppercase text-slate-600 dark:text-slate-300 outline-none cursor-pointer">
                <option>Newest First</option>
                <option>Frequency</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 size={40} className="animate-spin text-pink-500" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Loading Sentiments...</p>
              </div>
            ) : error ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle size={24} />
                </div>
                <p className="text-slate-900 dark:text-white font-bold">Failed to load emotions</p>
                <button onClick={() => reFetch()} className="text-pink-500 font-bold hover:underline">Try Again</button>
              </div>
            ) : filteredEmotions.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-medium text-lg italic">No emotions found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Emotion State</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Frequency</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmotions.map((emo) => (
                    <tr key={emo.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 flex items-center justify-center font-bold text-xs ring-1 ring-pink-100 dark:ring-pink-900/50">
                            {emo.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                            {emo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-500 font-mono">
                        {emo._count?.failures || 0} occurrences
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button
                            onClick={() => handleOpenModal(emo)}
                            className="p-2 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600 active:scale-90 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(emo.id)}
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
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 pb-0 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingEmotion ? 'Update' : 'New'} <span className="text-pink-500">Emotion.</span>
              </h3>
              <button onClick={handleCloseModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Emotion Name</label>
                <div className="relative">
                  <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/50" size={20} />
                  <input
                    type="text"
                    autoFocus
                    required
                    value={emotionName}
                    onChange={(e) => setEmotionName(e.target.value)}
                    placeholder="e.g. Frustrated"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                  />
                </div>
                {submitError && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl">
                    <AlertCircle size={16} />
                    <p className="text-xs font-bold">{submitError}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !emotionName.trim()}
                  className="flex-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isSubmitting ? 'Processing...' : editingEmotion ? 'Update State' : 'Create Emotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
