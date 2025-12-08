'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, HelpCircle, Settings, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
// Nota: Se createClient também der erro, tente adicionar { } ou remover, dependendo de como está no arquivo client.ts
import createClient from '@/utils/supabase/client'; 
// CORREÇÃO: Adicionadas as chaves { } porque não é um export default
import { VerificationBadge } from '@/components/VerificationBadge';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function EducationTopbar({ onMenuClick }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Busca dados reais do usuário
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Fecha o dropdown ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase.auth]);

  // Extrai iniciais ou usa avatar padrão
  const userInitial = user?.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : 'U';
  const userName = user?.user_metadata?.full_name || 'Estudante';
  const userEmail = user?.email || 'email@exemplo.com';
  // Lógica de verificação (ajuste se o campo no metadata for diferente)
  const isVerified = user?.user_metadata?.is_verified || false; 

  return (
    <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 sticky top-0 z-40 px-6 flex items-center justify-between transition-all duration-300">
      
      {/* Esquerda: Menu Mobile e Breadcrumb/Boas-vindas */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-xl font-bold text-neutral-800 leading-tight flex items-center gap-2">
            Olá, {userName.split(' ')[0]} 
            <span className="text-2xl">👋</span>
          </h2>
          <p className="text-xs font-medium text-neutral-500 flex items-center gap-1">
            Vamos aprender algo novo hoje?
          </p>
        </div>
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Barra de Busca (Expandível) */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar aulas, testes..." 
            className="pl-10 pr-4 py-2.5 bg-neutral-100/50 border border-neutral-200 hover:bg-white hover:border-neutral-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm w-64 transition-all outline-none shadow-sm"
          />
        </div>

        {/* Notificações */}
        <button className="relative p-3 text-neutral-500 hover:bg-neutral-100 hover:text-blue-600 rounded-2xl transition-all hover:shadow-sm group">
          <Bell size={22} className="group-hover:animate-swing" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        <div className="h-10 w-px bg-neutral-200 hidden md:block"></div>

        {/* Dropdown de Perfil "Chamativo" */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border transition-all duration-300 ${isProfileOpen ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-100' : 'bg-transparent border-transparent hover:bg-neutral-50'}`}
          >
            {/* Avatar com Gradiente */}
            <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-violet-600 to-fuchsia-600 rounded-full p-[2px]">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                            {userInitial}
                        </span>
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-neutral-800 leading-none max-w-[100px] truncate">
                    {userName}
                  </p>
                  {/* Badge Verificado renderizado condicionalmente */}
                  {isVerified && <VerificationBadge size="14px" />} 
              </div>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5 truncate max-w-[120px]">
                {userEmail}
              </p>
            </div>
            <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Dropdown Moderno */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-neutral-100 py-3 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden ring-1 ring-black/5">
              
              {/* Header do Dropdown */}
              <div className="px-6 py-4 bg-gradient-to-br from-neutral-50 to-white border-b border-neutral-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {userInitial}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-neutral-900">{userName}</p>
                        <p className="text-xs text-neutral-500 font-mono">{userEmail}</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-1">
                        <Sparkles size={10} /> Pro Plan
                    </span>
                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                        Online
                    </span>
                </div>
              </div>
              
              <div className="p-2 space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Conta
                </div>
                <Link 
                  href="/account" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="p-1.5 bg-neutral-100 text-neutral-500 rounded-lg group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    <Settings size={16} />
                  </div>
                  Gerenciar Conta
                </Link>
                
                <Link 
                  href="/recursos/ajuda" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="p-1.5 bg-neutral-100 text-neutral-500 rounded-lg group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    <HelpCircle size={16} />
                  </div>
                  Central de Ajuda
                </Link>
              </div>

              <div className="h-px bg-neutral-100 my-1 mx-4"></div>

              <div className="p-2">
                <form action="/auth/signout" method="post">
                    <button 
                    type="submit" 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all group"
                    >
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                        <LogOut size={16} />
                    </div>
                    Sair da conta
                    </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}