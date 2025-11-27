"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, CheckCircle2, Settings, User, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/app/dashboard/types";
import createClient from "@/utils/supabase/client"; // <--- CORRIGIDO: Sem chaves { }
import { useRouter } from "next/navigation";

interface TopbarProps {
  onMenuClick: () => void;
  user: UserProfile;
}

export default function Topbar({ onMenuClick, user }: TopbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Nome para exibição: Prioridade Full Name -> Nickname -> Email
  const displayName = user.full_name || user.nickname || user.email?.split('@')[0] || "Usuário";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-[#0f0f12]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all">
      
      {/* Esquerda: Botão Hambúrguer (Visível apenas em Mobile) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="flex items-center gap-4">
        
        {/* Busca (Desktop) */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-brand-purple/30 transition-all w-64">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Bell size={20} />
            {/* Bolinha de notificação */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-green rounded-full border border-white dark:border-[#0f0f12]"></span>
          </button>
          
          {/* Dropdown Notificações */}
          {isNotifOpen && (
             <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 animate-fade-in-up z-50">
                <p className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Notificações</p>
                <div className="text-xs text-gray-500 text-center py-4">Você não tem novas notificações.</div>
             </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

        {/* Perfil do Usuário */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 focus:outline-none group"
          >
            {/* Texto (Nome e Badge) */}
            <div className="text-right hidden md:block">
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-purple transition-colors">
                  {displayName}
                </span>
                {user.is_verified && <CheckCircle2 size={12} className="text-brand-green fill-brand-green/10" />}
              </div>
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {user.user_category || "Membro"}
              </p>
            </div>

            {/* Avatar */}
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${user.is_verified ? "from-brand-purple to-brand-green" : "from-gray-300 to-gray-400"}`}>
              <div className="p-[2px] bg-white dark:bg-[#0f0f12] rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative flex items-center justify-center">
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt="Avatar" 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <span className="text-xs font-bold text-brand-purple">
                       {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Dropdown Perfil */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 animate-fade-in-up z-50 origin-top-right">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <div className="px-2 space-y-1">
                <Link href="/dashboard/account" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-purple/5 hover:text-brand-purple rounded-lg transition-colors">
                  <User size={16} />
                  <span>Acessar Facillit Account</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Settings size={16} />
                  <span>Configurações</span>
                </Link>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-2">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}