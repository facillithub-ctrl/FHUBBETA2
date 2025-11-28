"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Bell, Search, Menu, User, LogOut, ChevronDown, Settings, Shield } from 'lucide-react';

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
    <header className="sticky top-0 z-30 h-20 px-6 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between transition-all">
      
      {/* Esquerda: Menu e Busca */}
      <div className="flex items-center gap-6 flex-1">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl lg:hidden transition-colors">
          <Menu size={22} />
        </button>
        
        <div className="hidden md:flex items-center w-full max-w-md relative group">
            <Search className="absolute left-4 text-gray-300 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Busque por alunos, turmas ou conteúdos..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple/10 focus:border-brand-purple/20 transition-all placeholder:text-gray-400 font-medium"
            />
        </div>
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="flex items-center gap-5">
        
        <button className="relative p-2.5 text-gray-400 hover:text-brand-purple hover:bg-purple-50 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:scale-105 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

        {/* User Dropdown Area */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
          >
            {/* Foto de Perfil Grande e Clean */}
            <div className="w-10 h-10 rounded-full bg-gray-100 p-[2px] ring-1 ring-gray-100 group-hover:ring-brand-purple/30 transition-all overflow-hidden relative">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                     {userProfile.avatarUrl ? (
                        <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-brand-purple to-brand-green text-white text-xs font-bold">{initials}</div>
                    )}
                </div>
            </div>
            
            {/* Nome e Badge (Verificado ao lado do nome) */}
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-800 leading-none group-hover:text-brand-purple transition-colors">
                    {displayName.split(' ')[0]}
                  </span>
                  {userProfile.verification_badge && (
                      <VerificationBadge badge={userProfile.verification_badge} size="4px" />
                  )}
              </div>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                Facillit Account <ChevronDown size={10} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          {/* Dropdown Menu Renovado */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Header do Dropdown */}
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 ring-2 ring-white shadow-md">
                             {userProfile.avatarUrl ? <Image src={userProfile.avatarUrl} alt="Avatar" width={48} height={48} className="object-cover" /> : <div className="w-full h-full bg-brand-purple flex items-center justify-center text-white text-lg font-bold">{initials}</div>}
                        </div>
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                {userProfile.verification_badge && <VerificationBadge badge={userProfile.verification_badge} size="12px" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate font-medium">{userProfile.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    {/* Botão de Destaque "Facillit Account" */}
                    <div className="px-2 pt-2 pb-1">
                        <Link 
                            href="/dashboard/account" 
                            className="flex items-center justify-between gap-3 w-full p-3 rounded-2xl bg-brand-dark text-white shadow-lg shadow-brand-dark/10 group transition-all hover:scale-[1.01] active:scale-[0.99]"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-lg text-brand-green">
                                    <Shield size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-0.5">Gerenciar</p>
                                    <p className="text-sm font-bold">Facillit Account</p>
                                </div>
                            </div>
                            <Settings size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                        </Link>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-2 mx-2"></div>

                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-brand-purple transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <User size={18} /> Meu Perfil Público
                    </Link>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 p-2">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Sair da conta
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