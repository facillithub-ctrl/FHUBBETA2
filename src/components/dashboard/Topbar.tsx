"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge';

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
  const initials = displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-[#0f0f12]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-royal-blue focus:outline-none lg:hidden transition-colors">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <div className="hidden md:block">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bem-vindo, <span className="text-dark-text dark:text-white font-bold">{displayName.split(' ')[0]}</span>
            </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-royal-blue transition-colors">
          <i className="far fa-bell text-xl"></i>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 focus:outline-none group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-dark-text dark:text-white group-hover:text-royal-blue transition-colors">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userProfile.userCategory || 'Usuário'}</p>
            </div>
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-cyan-400 p-[2px] shadow-md group-hover:shadow-royal-blue/30 transition-all">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden relative flex items-center justify-center">
                        {userProfile.avatarUrl ? <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" /> : <span className="font-bold text-royal-blue text-sm">{initials}</span>}
                    </div>
                </div>
                {userProfile.verification_badge && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5"><VerificationBadge badge={userProfile.verification_badge} size="10px" /></div>}
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1a1b1e] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-20 animate-fade-in-down">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 sm:hidden">
                    <p className="text-sm font-bold text-dark-text dark:text-white">{displayName}</p>
                </div>
                <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-royal-blue transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <i className="far fa-user w-5 text-center"></i> Meu Perfil
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-royal-blue transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <i className="fas fa-cog w-5 text-center"></i> Configurações
                </Link>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <i className="fas fa-sign-out-alt w-5 text-center"></i> Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}