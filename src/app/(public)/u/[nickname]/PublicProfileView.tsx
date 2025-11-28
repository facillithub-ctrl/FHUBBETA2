"use client";

import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';

// Definição de interface para garantir tipagem correta vinda do DB
interface ProfileData {
  full_name?: string;
  nickname?: string;
  avatar_url?: string;
  cover_image_url?: string;
  school_name?: string;
  bio?: string;
  level?: number;
  streak_days?: number;
  target_exam?: string;
  badges?: string[];
  social_links?: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  privacy_settings?: {
    is_public?: boolean;
    show_full_name?: boolean;
    show_school?: boolean;
    show_stats?: boolean;
    show_grades?: boolean;
    show_essays?: boolean;
    show_badges?: boolean;
  };
  verification_badge?: string;
}

export default function PublicProfileView({ profile }: { profile: ProfileData }) {
  const privacy = profile.privacy_settings || {
    is_public: false,
    show_full_name: false,
    show_school: true,
    show_stats: true,
    show_grades: false,
    show_essays: false,
    show_badges: true
  };

  const socialLinks = profile.social_links || {};

  // Função para formatar URL externa
  const formatUrl = (url: string) => url.startsWith('http') ? url : `https://${url}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* --- HEADER / CAPA --- */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-royal-blue to-brand-purple">
        {profile.cover_image_url && (
            <Image 
                src={profile.cover_image_url} 
                alt="Capa" 
                fill 
                className="object-cover opacity-50"
            />
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 md:p-8">
            
            {/* Topo: Avatar e Ações */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-dark-card overflow-hidden bg-gray-200 relative">
                        {profile.avatar_url ? (
                            <Image 
                              src={profile.avatar_url} 
                              alt={profile.nickname || ''} 
                              fill
                              className="object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                                {(profile.nickname?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                    </div>
                    {/* Badge de Nível */}
                    {privacy.show_badges && (
                        <div className="absolute bottom-0 right-0 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white z-10">
                            Lvl {profile.level || 1}
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {/* CORREÇÃO: full_name (snake_case) */}
                                {privacy.show_full_name ? profile.full_name : profile.nickname}
                                <VerificationBadge badge={profile.verification_badge} size="12px" />
                            </h1>
                            <p className="text-royal-blue font-mono">@{profile.nickname}</p>
                            
                            {/* CORREÇÃO: school_name (snake_case) */}
                            {privacy.show_school && profile.school_name && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <i className="fas fa-university"></i>
                                    {profile.school_name}
                                </p>
                            )}
                        </div>

                        {/* Botão de Compartilhar */}
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copiado!'); 
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-white rounded-lg transition-colors text-sm font-bold"
                        >
                            <i className="fas fa-share-alt"></i> Compartilhar
                        </button>
                    </div>

                    {/* Bio e Redes Sociais */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            {profile.bio ? (
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {profile.bio}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic text-sm">Este usuário ainda não escreveu uma bio.</p>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 justify-start md:justify-end h-fit">
                            {socialLinks.instagram && (
                                <a href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-pink-600 hover:opacity-80 text-2xl"><i className="fab fa-instagram"></i></a>
                            )}
                            {socialLinks.linkedin && (
                                <a href={formatUrl(socialLinks.linkedin)} target="_blank" rel="noreferrer" className="text-blue-700 hover:opacity-80 text-2xl"><i className="fab fa-linkedin"></i></a>
                            )}
                            {socialLinks.github && (
                                <a href={`https://github.com/${socialLinks.github}`} target="_blank" rel="noreferrer" className="text-gray-800 dark:text-white hover:opacity-80 text-2xl"><i className="fab fa-github"></i></a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRID DE CONTEÚDO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            {/* 1. Estatísticas Principais */}
            {privacy.show_stats && (
                <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md h-fit">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-royal-blue"></i> Desempenho
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-gray-500 text-sm">Dias de Ofensiva</span>
                            <span className="font-bold text-brand-orange">🔥 {profile.streak_days || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-gray-500 text-sm">Foco Atual</span>
                            <span className="font-bold text-royal-blue">{profile.target_exam || 'Geral'}</span>
                        </div>
                        {privacy.show_grades && (
                             <div className="flex justify-between items-center p-3 bg-royal-blue/5 border border-royal-blue/20 rounded-lg">
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Média Geral</span>
                                <span className="font-bold text-xl text-royal-blue">N/A</span> 
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Conteúdo Central (Redações, Conquistas) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Badges / Gamificação */}
                {privacy.show_badges && (
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-trophy text-yellow-500"></i> Conquistas
                        </h3>
                        {profile.badges && profile.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {profile.badges.map((badge, idx) => (
                                    <div key={idx} className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg w-24">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                                            <i className="fas fa-medal"></i>
                                        </div>
                                        <span className="text-xs text-center font-medium truncate w-full">{badge}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Nenhuma conquista desbloqueada ainda.</p>
                        )}
                    </div>
                )}

                {/* Últimas Redações */}
                {privacy.show_essays && (
                     <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-pen-nib text-brand-purple"></i> Escritas Recentemente
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 border-l-4 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Exemplo de Redação</h4>
                                <p className="text-xs text-gray-500 mt-1">Enviado recentemente</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            <i className="fas fa-lock mr-1"></i> O conteúdo das redações é privado.
                        </p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}