"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, CheckCircle2, Settings, User, LogOut, X } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  onMenuClick: () => void;
  user?: any;
}

export default function Topbar({ onMenuClick, user }: TopbarProps) {
  // Estados para os Dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Refs para fechar ao clicar fora
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Mock de notificações
  const notifications = [
    { id: 1, title: "Novo módulo liberado!", desc: "O módulo de Matemática avançada já está disponível.", time: "2 min atrás", unread: true },
    { id: 2, title: "Tarefa corrigida", desc: "Sua redação recebeu uma nota.", time: "1h atrás", unread: false },
    { id: 3, title: "Bem-vindo!", desc: "Complete seu perfil para ganhar um emblema.", time: "1d atrás", unread: false },
  ];

  // Efeito para fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userData = user || {
    name: "Estudante Facillit",
    email: "aluno@facillithub.com",
    avatar_url: null, // Teste com null para ver a inicial, ou coloque uma URL válida
    is_verified: true,
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/90 dark:bg-[#0f0f12]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      
      {/* 1. Mobile Trigger & Título Página (Opcional) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        {/* Espaço vazio ou Breadcrumbs aqui se desejar */}
      </div>

      {/* 2. Área de Ações */}
      <div className="flex items-center gap-4">
        
        {/* Busca */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-brand-purple/30 transition-all w-64">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="ml-2 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* --- Notificações --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Bell size={20} />
            {/* Red Dot se houver não lidas */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f0f12]"></span>
          </button>

          {/* Dropdown Notificações */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-gray-800 dark:text-white">Notificações</h3>
                <span className="text-[10px] text-brand-purple cursor-pointer hover:underline">Marcar como lidas</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex gap-3 ${notif.unread ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                     <div className="mt-1 h-2 w-2 rounded-full bg-brand-green flex-shrink-0" style={{opacity: notif.unread ? 1 : 0}} />
                     <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                     </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-gray-100 dark:border-gray-800">
                <Link href="/dashboard/notifications" className="text-xs font-medium text-gray-500 hover:text-brand-purple">
                  Ver todas
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

        {/* --- Perfil Dropdown --- */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 focus:outline-none"
          >
            {/* Badge de Verificado e Nome (Apenas desktop) */}
            <div className="text-right hidden md:block">
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {userData.name}
                </span>
                {userData.is_verified && <CheckCircle2 size={12} className="text-brand-green" />}
              </div>
              <p className="text-[10px] text-gray-400">Conta Gratuita</p>
            </div>

            {/* Avatar corrigido com Imagem ou Fallback */}
            <div className="relative group">
              <div className={`p-[2px] rounded-full bg-gradient-to-tr ${userData.is_verified ? "from-brand-purple to-brand-green" : "from-gray-300 to-gray-400"}`}>
                <div className="p-[2px] bg-white dark:bg-[#0f0f12] rounded-full">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {userData.avatar_url ? (
                      // Usando img tag padrão para garantir que carregue sem configurar domains no next.config
                      <img 
                        src={userData.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-xs font-bold text-brand-purple">
                        {userData.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Menu Suspenso (Dropdown) */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              
              {/* Header do Dropdown */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{userData.name}</p>
                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
              </div>

              {/* Itens do Menu */}
              <div className="space-y-1 px-2">
                <Link href="/dashboard/account" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-brand-purple rounded-lg transition-colors">
                  <User size={16} />
                  <span>Acessar Facillit Account</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Settings size={16} />
                  <span>Configurações</span>
                </Link>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-2">
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}