"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VerificationBadge } from '@/components/VerificationBadge';
import { 
  MapPin, Calendar, Share2, GraduationCap, 
  Trophy, Flame, BookOpen, Medal, Star, Shield, 
  UserPlus, Check, Gamepad2, PlayCircle, FileText, 
  PenTool, ArrowRight, Zap 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toggleFollow } from './actions';
import { useToast } from '@/contexts/ToastContext';

// ... (Sub-componentes MiniStat e BadgeItem mantêm-se iguais) ...
const MiniStat = ({ icon: Icon, label, value, colorClass, bgClass }: any) => (
  <div className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-md ${bgClass || 'bg-white dark:bg-gray-800'}`}>
    <div className={`p-2 rounded-full mb-2 ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${colorClass}`}>
        <Icon size={20} />
    </div>
    <span className="font-bold text-gray-800 dark:text-white text-xl">{value}</span>
    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">{label}</span>
  </div>
);

const BadgeItem = ({ name }: { name: string }) => (
    <div className="flex flex-col items-center group cursor-pointer">
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl rotate-3 group-hover:rotate-6 transition-all border border-yellow-200 dark:border-yellow-700 flex items-center justify-center shadow-sm">
            <Star className="text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" size={24} />
        </div>
        <span className="mt-2 text-[10px] text-center font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight max-w-[80px] leading-tight">{name}</span>
    </div>
);

export default function PublicProfileView({ 
  profile, isOwner, currentUser, initialIsFollowing, followersCount, followingCount 
}: any) {
  
  const { addToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [isPending, startTransition] = useTransition();

  const privacy = profile.privacy_settings || {
    is_public: false, show_full_name: false, show_school: true,
    show_stats: true, show_grades: false, show_essays: false, show_badges: true
  };

  const statsFuture = {
    simuladosFeitos: profile.stats_simulados || 12,
    mediaGeral: profile.stats_media ? `${profile.stats_media}` : "780",
    jogosJogados: profile.stats_games || 5,
    aulasAssistidas: profile.stats_classes || 24
  };

  const handleFollow = () => {
    if (!currentUser) {
        addToast({ title: 'Login necessário', message: 'Entre na sua conta para seguir.', type: 'info' });
        return;
    }
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setFollowers((prev: number) => isFollowing ? prev - 1 : prev + 1);

    startTransition(async () => {
        const result = await toggleFollow(profile.id, window.location.pathname);
        if (result?.error) {
            setIsFollowing(previousState);
            setFollowers((prev: number) => previousState ? prev + 1 : prev - 1);
            addToast({ title: 'Erro', message: result.error, type: 'error' });
        }
    });
  };

  const currentXp = profile.current_xp || 0;
  const nextLevelXp = profile.next_level_xp || 1000;
  const xpPercentage = Math.min(Math.round((currentXp / nextLevelXp) * 100), 100);
  const joinDate = profile.created_at ? format(new Date(profile.created_at), "MMM yyyy", { locale: ptBR }) : 'N/A';

  return (
    <div className="pb-20 animate-in fade-in duration-700 bg-gray-50 dark:bg-gray-900">
      
      {/* --- 1. CAPA (HERO) --- */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
        
        {/* Fundo Gradiente da Marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-royal-blue via-[#4f46e5] to-brand-purple z-0"></div>
        
        {/* LOGO CENTRALIZADA COM FILTRO BRANCO NA CAPA */}
        {/* Usamos opacity-20 para ficar sutil, como marca d'água */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 z-10 opacity-20 pointer-events-none select-none">
             <Image 
                src="/assets/images/accont.svg" 
                alt="Logo Marca D'água" 
                fill 
                className="object-contain brightness-0 invert" 
             />
        </div>

        {/* Overlay de Imagem de Usuário (se houver) */}
        {profile.cover_image_url && (
           <Image 
             src={profile.cover_image_url} 
             alt="Capa do Usuário" 
             fill 
             className="object-cover opacity-60 mix-blend-overlay z-0" 
             priority 
           />
        )}

        {/* Degradê inferior para fusão suave com o conteúdo */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-black/10 z-10"></div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Mantido Igual) --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24 md:-mt-32">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* COLUNA ESQUERDA: CARD DE IDENTIDADE */}
            <div className="w-full lg:w-80 flex-shrink-0 group">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-royal-blue/10 border border-white/50 dark:border-gray-700 overflow-hidden sticky top-24 backdrop-blur-sm">
                    
                    {/* Topo do Card com Efeito Glass */}
                    <div className="h-24 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative">
                        {/* Avatar Flutuante */}
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                             <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-white dark:bg-gray-800 shadow-xl">
                                <div className="w-full h-full rounded-full overflow-hidden relative border-4 border-gray-50 dark:border-gray-700">
                                    {profile.avatar_url ? (
                                        <Image src={profile.avatar_url} alt={profile.nickname} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-royal-blue bg-blue-50">
                                            {profile.nickname?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-10 flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> {profile.level || 1}
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 flex-wrap mb-1">
                            {privacy.show_full_name ? profile.full_name : profile.nickname}
                            <VerificationBadge badge={profile.verification_badge} size="22px" />
                        </h1>
                        <p className="text-royal-blue font-medium mb-6 bg-blue-50 dark:bg-blue-900/20 py-1 px-3 rounded-full text-sm inline-block">
                            @{profile.nickname}
                        </p>

                        <div className="flex gap-3 justify-center mb-8">
                            {!isOwner && (
                                <button 
                                    onClick={handleFollow}
                                    disabled={isPending}
                                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5
                                    ${isFollowing 
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600' 
                                        : 'bg-gradient-to-r from-royal-blue to-blue-600 text-white shadow-blue-500/30'
                                    }`}
                                >
                                    {isFollowing ? <><Check size={18} /> Seguindo</> : <><UserPlus size={18} /> Seguir</>}
                                </button>
                            )}
                            <button 
                                onClick={() => { navigator.clipboard.writeText(window.location.href); addToast({title:'Link copiado!', type:'success'}); }}
                                className="p-2.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-y border-gray-100 dark:border-gray-700 py-4 mb-6">
                            <div className="text-center">
                                <span className="block font-bold text-xl text-gray-900 dark:text-white">{followers}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Seguidores</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-xl text-gray-900 dark:text-white">{followingCount}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Seguindo</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 text-left">
                             {privacy.show_school && profile.school_name && (
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-royal-blue">
                                        <GraduationCap size={16} />
                                    </div>
                                    <span className="truncate font-medium">{profile.school_name}</span>
                                </div>
                            )}
                            {profile.address_city && (
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                     <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-brand-purple">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="font-medium">{profile.address_city}, {profile.address_state}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                 <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                    <Calendar size={16} />
                                </div>
                                <span className="font-medium">Membro desde {joinDate}</span>
                            </div>
                        </div>

                        {profile.subjects && profile.subjects.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-left">Focos de Estudo</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.subjects.map((subj: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-transparent hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-default">
                                            {subj}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className="flex-1 space-y-8 lg:mt-24">
                
                {/* BIO & PROGRESSO */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <BookOpen size={20} className="text-brand-purple" /> Sobre o estudante
                             </h2>
                             <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {profile.bio || "Este estudante está focado nos estudos, mas ainda não escreveu uma bio personalizada."}
                             </p>
                        </div>
                        
                        <div className="w-full md:w-72 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Nível Atual</span>
                                    <span className="font-bold text-2xl text-gray-800 dark:text-white">{profile.level || 1}</span>
                                </div>
                                <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange">
                                    <Trophy size={20} />
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-brand-orange to-red-500 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${xpPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 flex justify-between">
                                <span>{currentXp} XP</span>
                                <span>{nextLevelXp} XP</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* GRID DE STATS */}
                {privacy.show_stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <MiniStat icon={Flame} label="Ofensiva" value={`${profile.streak_days || 0} dias`} colorClass="text-brand-orange" />
                         <MiniStat icon={FileText} label="Simulados" value={statsFuture.simuladosFeitos} colorClass="text-blue-500" />
                         <MiniStat icon={Trophy} label="Média Geral" value={statsFuture.mediaGeral} colorClass="text-yellow-500" />
                         <MiniStat icon={Zap} label="Aulas Vistas" value={statsFuture.aulasAssistidas} colorClass="text-brand-purple" />
                    </div>
                )}

                {/* GPS / SUGESTÃO DE AÇÃO */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-royal-blue rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Facillit GPS</span>
                                <span className="text-gray-300 text-xs">Sugestão Automática</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">Quer alcançar resultados parecidos?</h3>
                            <p className="text-gray-300 text-sm max-w-md">
                                Crie um plano de estudos personalizado baseado nas suas metas e compare seu desempenho.
                            </p>
                        </div>
                        <Link 
                            href="/dashboard"
                            className="whitespace-nowrap px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                        >
                            Criar meu Plano <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* REDAÇÕES */}
                {privacy.show_essays && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-royal-blue" /> Redações Recentes
                             </h3>
                             {!isOwner && <Shield size={16} className="text-gray-400" title="Conteúdo Privado" />}
                        </div>
                        
                        <div className="space-y-4">
                             {[
                                { title: "A democratização do acesso ao cinema no Brasil", date: "Há 3 dias" },
                                { title: "Desafios para a formação educacional de surdos", date: "Há 1 semana" }
                             ].map((essay, i) => (
                                <div key={i} className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-gray-600">
                                    <div className="flex items-start gap-4 mb-3 md:mb-0">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100 dark:border-gray-600 shadow-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-royal-blue transition-colors line-clamp-1">
                                                {essay.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold">ENEM</span>
                                                <span>• {essay.date}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:pl-4">
                                        {isOwner ? (
                                            <span className="font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg text-xs">920</span>
                                        ) : (
                                            <Link 
                                                href="/dashboard/applications/write" 
                                                className="hidden group-hover:flex items-center gap-1 text-xs font-bold text-royal-blue bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-blue-100 dark:border-gray-600 hover:scale-105 transition-transform"
                                            >
                                                <PenTool size={12} />
                                                Praticar esse tema
                                            </Link>
                                        )}
                                    </div>
                                </div>
                             ))}
                        </div>
                         {!isOwner && (
                            <p className="text-xs text-gray-400 mt-4 text-center bg-gray-50 dark:bg-gray-900/50 py-2 rounded-lg">
                                <Shield size={10} className="inline mr-1" />
                                O texto completo e a correção são visíveis apenas para o autor.
                            </p>
                        )}
                    </div>
                )}

                {/* CONQUISTAS */}
                {privacy.show_badges && (
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Medal size={20} className="text-yellow-500" /> Medalhas
                         </h3>
                         {profile.badges && profile.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                {profile.badges.map((badge: string, i: number) => (
                                    <BadgeItem key={i} name={badge} />
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                                <Medal size={32} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Nenhuma medalha desbloqueada ainda.</p>
                            </div>
                         )}
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}