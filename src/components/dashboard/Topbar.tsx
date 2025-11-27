"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Bell, Search, Menu, Settings, User, LogOut, ChevronDown } from 'lucide-react';

type TopbarProps = {
  userProfile: UserProfile;
  toggleSidebar: () => void;
};

export default function Topbar({ userProfile, toggleSidebar }: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!userProfile) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = userProfile.fullName || userProfile.nickname || "Usuário";
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-20 px-6 sm:px-8 bg-white/80 dark:bg-[#0f0f12]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 transition-all flex items-center justify-between shadow-sm">
      
      <div className="flex items-center gap-6 flex-1">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-500 hover:text-[#42047e] hover:bg-purple-50 rounded-xl lg:hidden transition-all">
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center w-full max-w-md relative group">
            <Search className="absolute left-3 text-gray-400 group-focus-within:text-[#42047e] transition-colors" size={18} />
            <input type="text" placeholder="Pesquisar..." className="w-full bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#42047e]/20 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder:text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="relative p-2.5 text-gray-400 hover:text-[#42047e] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#42047e] to-blue-600 p-[2px] shadow-md shadow-[#42047e]/20 group-hover:shadow-[#42047e]/40 transition-shadow">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden flex items-center justify-center relative">
                        {userProfile.avatarUrl ? <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" /> : <span className="font-bold text-sm text-[#42047e]">{initials}</span>}
                    </div>
                </div>
                {userProfile.verification_badge && <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-[2px]"><VerificationBadge badge={userProfile.verification_badge} size="14px" /></div>}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">{firstName} <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} /></p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{userProfile.userCategory || 'Membro'}</p>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-[#1a1b1e] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 py-6 bg-gradient-to-br from-[#42047e]/5 to-transparent border-b border-gray-100 dark:border-gray-800">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{userProfile.email}</p>
                </div>
                <div className="p-2 space-y-1">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><User size={16} /></div> Meu Perfil
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Settings size={16} /></div> Configurações
                    </Link>
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4"></div>
                <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform"><LogOut size={16} /></div> Sair da conta
                    </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}