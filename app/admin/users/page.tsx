'use client';

import React, { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { 
  Users, 
  Search, 
  Trash2, 
  ShieldAlert,
  Loader2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  _count?: {
    failures: number;
  };
}

interface UserResponse {
  users: User[];
  total: number;
  pagination: {
    page: number;
    totalPages: number;
  };
}

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search input — ส่ง API call หลังหยุดพิมพ์ 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset หน้าเมื่อ search เปลี่ยน
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset หน้าเมื่อ role filter เปลี่ยน
  const handleRoleFilter = (role: 'ALL' | 'USER' | 'ADMIN') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const { data: usersData, loading, error, reFetch } = useFetch<UserResponse>(
    `/api/admin/user?page=${currentPage}&limit=20&role=${roleFilter}&search=${encodeURIComponent(debouncedSearch)}`
  );
  
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const users = usersData?.users || [];

  const handleUpdateRole = async (id: string, newRole: 'USER' | 'ADMIN') => {
    setUpdatingUserId(id);
    try {
      await axios.patch(`/api/admin/user/${id}`, { role: newRole });
      reFetch();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Failed to update role');
      } else {
        alert('Failed to update role');
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/admin/user/${id}`);
      reFetch();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Failed to delete user');
      } else {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert size={14} />
              Identity Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              User <span className="text-blue-500">Base.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              Manage roles, permissions and account access across the platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Total</span>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{usersData?.total || 0}</span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-300">
          {/* Toolbar */}
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
                 {(['ALL', 'USER', 'ADMIN'] as const).map(role => (
                   <button
                    key={role}
                    onClick={() => handleRoleFilter(role)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      roleFilter === role 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                   >
                     {role}
                   </button>
                 ))}
              </div>
              <button 
                onClick={() => {
                  setIsRefreshing(true);
                  reFetch().finally(() => setIsRefreshing(false));
                }}
                disabled={isRefreshing}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105 active:scale-95"
              >
                <Loader2 size={18} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
             {loading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-900 dark:text-white">SCANNING DATABASES</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Retrieving encrypted identity records...</p>
                  </div>
                </div>
             ) : error ? (
                <div className="p-24 flex flex-col items-center justify-center gap-6 text-center">
                   <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                     <AlertCircle size={32} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-xl font-bold text-slate-900 dark:text-white">Access Violation or Sync Error</p>
                     <p className="text-sm text-slate-500">{error}</p>
                   </div>
                   <button onClick={() => reFetch()} className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all active:scale-95">Re-establish Sync</button>
                </div>
             ) : users.length === 0 ? (
               <div className="p-24 text-center">
                  <p className="text-slate-400 font-bold text-xl uppercase tracking-widest font-mono opacity-50">NO MATCHING SUBJECT NUMBERS FOUND</p>
               </div>
             ) : (
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Identification / User</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authorization Level</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Registered Date</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Operational Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {users.map((user) => (
                     <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                           <div className="relative w-12 h-12 shrink-0">
                             {user.image ? (
                               <Image 
                                 src={user.image} 
                                 alt={user.name || 'User'} 
                                 fill 
                                 className="rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                               />
                             ) : (
                               <div className="w-full h-full rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg ring-2 ring-slate-100 dark:ring-slate-800">
                                 {user.name?.[0].toUpperCase() || user.email[0].toUpperCase()}
                               </div>
                             )}
                             <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`} title="Active Session" />
                           </div>
                           <div className="flex flex-col">
                             <Link href={`/admin/users/${user.id}`} className="text-base font-black text-slate-900 dark:text-white capitalize leading-tight mb-1 hover:text-blue-500 transition-colors">
                               {user.name || 'Anonymous User'}
                             </Link>
                             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                               <Mail size={12} className="opacity-50" />
                               {user.email}
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                          {updatingUserId === user.id ? (
                            <div className="flex items-center gap-2 text-blue-500">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-widest">SYNCING...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${
                                  user.role === 'ADMIN' 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 ring-2 ring-blue-500/20' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {user.role === 'ADMIN' ? <ShieldCheck size={12} /> : <Users size={12} />}
                                {user.role}
                              </button>
                            </div>
                          )}
                       </td>
                       <td className="px-8 py-6">
                         <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 font-mono uppercase">
                              Registered
                            </span>
                         </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                             <button
                               onClick={() => handleDeleteUser(user.id)}
                               className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 active:scale-90 transition-all shadow-sm"
                               title="Permanently De-auth User"
                             >
                               <Trash2 size={18} />
                             </button>
                             <Link
                               href={`/admin/users/${user.id}`}
                               className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 active:scale-90 transition-all shadow-sm inline-flex items-center justify-center"
                               title="View Details"
                             >
                               <ChevronRight size={18} />
                             </Link>
                          </div>
                          {/* Visible badge when not hovered */}
                          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest group-hover:hidden transition-all">Operational</p>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
          
          {/* Pagination */}
          {usersData && usersData.pagination.totalPages > 1 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
               {Array.from({ length: usersData.pagination.totalPages }, (_, i) => i + 1).map(page => (
                 <button
                   key={page}
                   onClick={() => setCurrentPage(page)}
                   className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                     currentPage === page 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110' 
                     : 'bg-slate-100 dark:bg-slate-900/50 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                   }`}
                 >
                   {page}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
