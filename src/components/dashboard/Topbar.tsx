"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Bell, Search, Menu, User, LogOut, ChevronDown, Settings } from 'lucide-react';

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
    <header className="sticky top-0 z-30 h-16 px-6 bg-white/80 dark:bg-[#0f0f12]/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 flex items-center justify-between">
      
      {/* Busca e Menu Mobile */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center w-full max-w-sm relative group">
            <Search className="absolute left-3 text-gray-400 group-focus-within:text-[#42047e] transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-[#42047e]/50 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder:text-gray-400 font-medium"
            />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4">
        
        <button className="relative p-2 text-gray-400 hover:text-[#42047e] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-900 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-200/50"
          >
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-2 ring-transparent group-hover:ring-[#42047e]/20 transition-all">
                    {userProfile.avatarUrl ? (
                        <Image src={userProfile.avatarUrl} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#42047e] to-[#07f49e] text-white text-xs font-bold">{initials}</div>
                    )}
                </div>
                {userProfile.verification_badge && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-[2px] shadow-sm">
                         <VerificationBadge badge={userProfile.verification_badge} size="12px" />
                    </div>
                )}
            </div>
            
            <div className="text-left hidden sm:block pr-1">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight flex items-center gap-1 group-hover:text-[#42047e] transition-colors">
                  {firstName} 
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a1b1e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                
                <div className="p-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                         {userProfile.avatarUrl ? <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="object-cover" /> : <div className="w-full h-full bg-[#42047e] flex items-center justify-center text-white text-sm font-bold">{initials}</div>}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    {/* Botão de Destaque Solicitado */}
                    <Link 
                        href="/dashboard/account" 
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#42047e] hover:bg-[#350365] text-white text-sm font-bold shadow-lg shadow-[#42047e]/20 transition-all mb-3 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        <Settings size={16} /> Gerenciar minha conta
                    </Link>

                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#42047e] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <User size={16} /> Meu Perfil Público
                    </Link>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <LogOut size={16} /> Sair
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