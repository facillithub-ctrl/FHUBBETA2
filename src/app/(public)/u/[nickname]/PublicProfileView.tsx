"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '@/app/dashboard/types';
import { StoryPost } from '@/app/dashboard/applications/global/stories/types'; // Importar tipo StoryPost
import { toggleFollow } from './actions';
import ShareProfileButton from '@/components/sharing/ShareProfileButton';
import { useToast } from '@/contexts/ToastContext';
import { VerificationBadge } from '@/components/VerificationBadge'; 
import PostCard from '@/app/dashboard/applications/global/stories/components/PostCard'; // Reuso do PostCard

// Estendemos a interface para incluir os stories que vêm da action
interface EnhancedUserProfile extends UserProfile {
    stories?: StoryPost[];
    recent_essays?: any[];
    stats_media?: number;
    stats_simulados?: number;
}

interface PublicProfileViewProps {
  profile: EnhancedUserProfile;
  isOwner: boolean;
  currentUser: any;
  initialIsFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

type TabType = 'stories' | 'essays' | 'achievements';

export default function PublicProfileView({
  profile,
  isOwner,
  currentUser,
  initialIsFollowing,
  followersCount: initialFollowersCount,
  followingCount,
}: PublicProfileViewProps) {
  
  const [activeTab, setActiveTab] = useState<TabType>('stories'); // Stories como padrão (mais engajamento)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleFollow = () => {
    if (!currentUser) {
      addToast({ title: 'Login necessário', message: 'Faça login para seguir estudantes.', type: 'info' });
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

    startTransition(async () => {
      const result = await toggleFollow(profile.id, `/u/${profile.nickname}`);
      if (result?.error) {
        setIsFollowing(previousState);
        setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      }
    });
  };

  const shareStats = {
    followers: followersCount,
    following: followingCount
  };

  const joinedDate = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  const schoolDisplay = profile.school_name || profile.schoolName;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* CAPA */}
      <div className="relative h-64 md:h-80 w-full group">
        {profile.cover_image_url ? (
            <Image
                src={profile.cover_image_url}
                alt="Capa do perfil"
                fill
                className="object-cover"
                priority
            />
        ) : (
            <div className="w-full h-full bg-brand-gradient relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/images/pattern-grid.svg')] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
        )}
        
        {isOwner && (
            <Link 
                href="/dashboard/profile"
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
            >
                <i className="fas fa-camera"></i>
                <span className="hidden md:inline">Alterar Capa</span>
            </Link>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER PERFIL */}
        <div className="relative -mt-[80px] mb-8 flex flex-col md:flex-row items-start gap-6">
            
            <div className="relative shrink-0 mx-auto md:mx-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-gray-900 bg-white shadow-2xl overflow-hidden relative z-10">
                    {profile.avatar_url ? (
                        <Image 
                            src={profile.avatar_url} 
                            alt={profile.nickname || 'Avatar'} 
                            fill 
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <i className="fas fa-user text-6xl"></i>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 text-center md:text-left pt-2 md:pt-[90px] w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {profile.full_name}
                            </h1>
                            <VerificationBadge badge={profile.verification_badge} size="12px" />
                        </div>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">@{profile.nickname}</p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        {isOwner ? (
                            <Link 
                                href="/dashboard/profile" 
                                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-full transition-all shadow-sm flex items-center gap-2"
                            >
                                <i className="fas fa-pen text-sm"></i>
                                <span>Editar Perfil</span>
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={handleFollow}
                                    disabled={isPending}
                                    className={`px-8 py-2.5 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${
                                        isFollowing 
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-200'
                                            : 'bg-brand-purple text-white hover:bg-brand-purple/90 hover:scale-105 shadow-brand-purple/20'
                                    }`}
                                >
                                    {isPending ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                    ) : isFollowing ? (
                                        <><span>Seguindo</span> <i className="fas fa-check"></i></>
                                    ) : (
                                        <><span>Seguir</span> <i className="fas fa-user-plus"></i></>
                                    )}
                                </button>
                                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                                    <i className="fas fa-envelope"></i>
                                </button>
                            </>
                        )}

                        <ShareProfileButton 
                            profile={profile} 
                            stats={shareStats} 
                            variant="icon" 
                            className="bg-white border-gray-200 text-gray-700 hover:text-brand-purple"
                        />
                    </div>
                </div>

                <div className="mt-6 max-w-3xl">
                     {profile.bio && (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                            {profile.bio}
                        </p>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                         <div className="flex items-center gap-4">
                            <div className="hover:text-brand-purple transition-colors cursor-pointer">
                                <span className="font-bold text-gray-900 dark:text-white text-base">{followersCount}</span> Seguidores
                            </div>
                            <div className="hover:text-brand-purple transition-colors cursor-pointer">
                                <span className="font-bold text-gray-900 dark:text-white text-base">{followingCount}</span> Seguindo
                            </div>
                         </div>
                         
                         {joinedDate && (
                             <div className="flex items-center gap-1.5">
                                 <i className="far fa-calendar-alt"></i>
                                 <span>Entrou em {joinedDate}</span>
                             </div>
                         )}

                         {profile.social_links?.website && (
                             <a href={profile.social_links.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-purple hover:underline">
                                 <i className="fas fa-link"></i>
                                 <span>Website</span>
                             </a>
                         )}
                    </div>
                </div>
            </div>
        </div>

        {/* GRID DE INFORMAÇÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-4 space-y-6">
                
                {/* Sobre */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                        <i className="fas fa-graduation-cap text-brand-purple"></i>
                        Sobre
                    </h3>
                    
                    <ul className="space-y-4">
                        {schoolDisplay && (
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <i className="fas fa-university text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Instituição</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{schoolDisplay}</p>
                                </div>
                            </li>
                        )}
                        
                        <li className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <i className="fas fa-bullseye text-sm"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Foco Principal</p>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{profile.target_exam || "Geral"}</p>
                            </div>
                        </li>

                        {(profile.social_links?.instagram || profile.social_links?.linkedin || profile.social_links?.github) && (
                            <li className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex gap-3 justify-start">
                                    {profile.social_links.instagram && (
                                        <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-pink-50 hover:text-pink-600 text-gray-500 flex items-center justify-center transition-all">
                                            <i className="fab fa-instagram text-lg"></i>
                                        </a>
                                    )}
                                    {profile.social_links.linkedin && (
                                        <a href={profile.social_links.linkedin} target="_blank" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 flex items-center justify-center transition-all">
                                            <i className="fab fa-linkedin-in text-lg"></i>
                                        </a>
                                    )}
                                    {profile.social_links.github && (
                                        <a href={`https://github.com/${profile.social_links.github}`} target="_blank" className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-200 hover:text-black text-gray-500 flex items-center justify-center transition-all">
                                            <i className="fab fa-github text-lg"></i>
                                        </a>
                                    )}
                                </div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Estatísticas */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                     <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-green-500"></i>
                        Estatísticas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {profile.stats_media ? profile.stats_media.toFixed(0) : '-'}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Média Geral</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {profile.stats_simulados || 0}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Simulados</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* COLUNA DIREITA: CONTEÚDO */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Abas de Navegação */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('stories')}
                        className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                            activeTab === 'stories' 
                                ? 'border-brand-purple text-brand-purple' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <i className="fas fa-feather-alt"></i>
                        Stories
                    </button>
                    <button 
                        onClick={() => setActiveTab('essays')}
                        className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                            activeTab === 'essays' 
                                ? 'border-brand-purple text-brand-purple' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <i className="fas fa-file-alt"></i>
                        Redações
                    </button>
                    <button 
                        onClick={() => setActiveTab('achievements')}
                        className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                            activeTab === 'achievements' 
                                ? 'border-brand-purple text-brand-purple' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <i className="fas fa-trophy"></i>
                        Conquistas
                    </button>
                </div>

                {/* Conteúdo das Abas */}
                <div className="min-h-[300px]">
                    
                    {/* ABA STORIES */}
                    {activeTab === 'stories' && (
                        <div className="space-y-6 animate-in fade-in">
                            {profile.stories && profile.stories.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.stories.map((post) => (
                                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            {/* Passamos o currentUserId apenas para habilitar likes/comentários, 
                                                mas não edição, a menos que seja o dono */}
                                            <PostCard post={post} currentUserId={currentUser?.id} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <i className="fas fa-feather-alt text-2xl opacity-50"></i>
                                    </div>
                                    <p>Nenhum post publicado ainda.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ABA REDAÇÕES */}
                    {activeTab === 'essays' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in">
                            <div className="p-6">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Últimas Redações</h3>
                                <div className="space-y-4">
                                    {profile.recent_essays && profile.recent_essays.length > 0 ? (
                                        profile.recent_essays.map((essay, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all group">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-purple transition-colors">
                                                        <i className="fas fa-file-alt text-xl"></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-brand-purple transition-colors line-clamp-1">
                                                            {essay.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            <i className="far fa-clock mr-1"></i>
                                                            {new Date(essay.created_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end pl-4">
                                                    {essay.final_grade ? (
                                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                                            essay.final_grade >= 900 ? 'bg-green-100 text-green-700' :
                                                            essay.final_grade >= 700 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {essay.final_grade} pts
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Corrigindo...</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                            <p>Nenhuma redação pública disponível ainda.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABA CONQUISTAS (Placeholder) */}
                    {activeTab === 'achievements' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed animate-in fade-in">
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4 text-yellow-400">
                                <i className="fas fa-trophy text-3xl"></i>
                            </div>
                            <h3 className="font-bold text-lg text-gray-700 mb-1">Galeria de Conquistas</h3>
                            <p>Em breve você poderá ver os troféus e medalhas deste aluno.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}