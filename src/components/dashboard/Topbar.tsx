"use client";

import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Buscar dados adicionais do perfil (como avatar ou nome completo)
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
        setProfile(profileData);
      }
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  // Obter iniciais para o avatar
  const getInitials = (name: string) => {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-24 bg-gray-50/80 backdrop-blur-md z-30 flex items-center justify-between px-6 md:px-10 transition-all duration-300">
      
      {/* Esquerda: Menu Mobile + Título/Boas-vindas */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-purple transition-colors"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>

        <div className="hidden md:block">
            <h2 className="text-lg font-bold text-gray-800">
               {loading ? '...' : `Olá, ${profile?.full_name?.split(' ')[0] || 'Estudante'}! 👋`}
            </h2>
            <p className="text-xs text-gray-500">Bem-vindo ao seu Hub.</p>
        </div>
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Notificações */}
        <button className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-purple hover:shadow-md transition-all">
            <i className="far fa-bell"></i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Perfil -> Link para Facillit Account */}
        <Link 
            href="/dashboard/account" 
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white hover:shadow-sm transition-all group"
        >
            <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-800 group-hover:text-brand-purple transition-colors">Facillit Account</p>
                <p className="text-[10px] text-gray-400">Gerir Conta</p>
            </div>
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-brand-gradient p-[2px] relative">
                <div className="w-full h-full rounded-full bg-white relative overflow-hidden flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-brand-purple">
                            {getInitials(profile?.full_name)}
                        </span>
                    )}
                </div>
                {/* Badge de status */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
        </Link>

      </div>
    </header>
  );
}