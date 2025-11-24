"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile, UserStats } from '@/app/dashboard/types'; // Importando UserStats
import { useTheme } from '@/components/ThemeProvider';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { VerificationBadge } from '@/components/VerificationBadge';

const modulesData = [
  { slug: 'edu', icon: 'fa-graduation-cap', title: 'Edu' },
  { slug: 'games', icon: 'fa-gamepad', title: 'Games' },
  { slug: 'write', icon: 'fa-pencil-alt', title: 'Write' },
  { slug: 'day', icon: 'fa-calendar-check', title: 'Day' },
  { slug: 'play', icon: 'fa-play-circle', title: 'Play' },
  { slug: 'library', icon: 'fa-book-open', title: 'Library' },
  { slug: 'connect', icon: 'fa-users', title: 'Connect' },
  { slug: 'coach-career', icon: 'fa-bullseye', title: 'Coach' },
  { slug: 'lab', icon: 'fa-flask', title: 'Lab' },
  { slug: 'test', icon: 'fa-file-alt', title: 'Test' },
  { slug: 'task', icon: 'fa-tasks', title: 'Task' },
  { slug: 'create', icon: 'fa-lightbulb', title: 'Create' },
];

type TopbarProps = {
  userProfile: UserProfile;
  toggleSidebar: () => void;
  stats?: UserStats; // Agora é opcional, mas aceita os dados
};

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

// ... (ModuleManager mantém-se igual) ...
const ModuleManager = ({ userProfile, onClose }: { userProfile: UserProfile; onClose: () => void; }) => {
    const [selectedModules, setSelectedModules] = useState(userProfile.active_modules || []);
    const [isPending, startTransition] = useTransition();
    const supabase = createClient();
    const router = useRouter();

    const toggleModule = (slug: string) => {
        if (userProfile.userCategory === 'diretor' && slug === 'edu') {
            alert("O módulo Edu é essencial para diretores e não pode ser desativado.");
            return;
        }
        setSelectedModules(prev =>
            prev.includes(slug) ? prev.filter(m => m !== slug) : [...prev, slug]
        );
    };

    const handleSave = () => {
        startTransition(async () => {
            const { error } = await supabase
                .from('profiles')
                .update({ active_modules: selectedModules })
                .eq('id', userProfile.id);

            if (!error) {
                alert("Módulos atualizados!");
                onClose();
                router.refresh();
            } else {
                alert("Erro ao salvar: " + error.message);
            }
        });
    };

    return (
        <div className="absolute top-full right-0 mt-4 w-[90vw] max-w-sm md:w-80 bg-white rounded-xl shadow-xl border z-10 p-4 dark:bg-gray-700 dark:border-gray-600">
            <h3 className="font-bold text-center mb-4 dark:text-white">Gerenciar Módulos</h3>
            <div className="grid grid-cols-3 gap-2">
                {modulesData.map((module) => {
                    const isSelected = selectedModules.includes(module.slug);
                    const isDisabled = module.slug === 'edu' && userProfile.userCategory !== 'diretor';
                    
                    return (
                        <button
                            key={module.slug}
                            onClick={() => toggleModule(module.slug)}
                            disabled={isDisabled}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all 
                                ${isSelected ? 'bg-royal-blue text-white border-royal-blue' 
                                            : 'hover:border-royal-blue'}
                                ${isDisabled ? 'bg-gray-100 opacity-60 cursor-not-allowed hover:border-gray-300' : ''}
                            `}
                        >
                             <i className={`fas ${module.icon} text-2xl mb-1 ${isSelected ? 'text-white' : 'text-royal-blue'} ${isDisabled ? '!text-gray-400' : ''}`}></i>
                             <span className="text-xs font-medium">{module.title}</span>
                             {isDisabled && <span className="absolute top-1 right-1 text-[8px] font-bold bg-gray-500 text-white px-1.5 py-0.5 rounded-full">Gestor</span>}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={isPending} className="text-sm font-bold bg-royal-blue text-white py-1 px-3 rounded-md disabled:bg-gray-400">
                    {isPending ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};

export default function Topbar({ userProfile, toggleSidebar, stats }: TopbarProps) {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isGridOpen, setGridOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const { theme } = useTheme();
  const router = useRouter();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setNotifications(data);
      }
    };
    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          setNotifications(current => [payload.new as Notification, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userProfile.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) setGridOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some(n => !n.is_read);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
        setNotifications(current => current.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
    }
    startTransition(async () => {
        if (!notification.is_read) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
        }
    });
    if (notification.link) {
        router.push(notification.link);
    }
    setNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(current => current.map(n => ({ ...n, is_read: true })));
    startTransition(async () => {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
      }
    });
  };

  return (
    <header className="bg-light-gray border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-royal-blue text-xl lg:hidden">
            <i className="fas fa-bars"></i>
        </button>
        <div className="relative hidden sm:block">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="search" placeholder="Busca universal..." className="w-full max-w-xs bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-royal-blue dark:bg-gray-700 dark:text-white"/>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* --- VISUALIZAÇÃO DE STATS (STREAK) --- */}
        {stats && stats.streak > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full border border-orange-200" title="Sua sequência de dias estudando!">
             <i className="fas fa-fire animate-pulse"></i>
             <span className="font-bold text-sm">{stats.streak}</span>
          </div>
        )}

        <div className="relative" ref={gridRef}>
            <button onClick={() => setGridOpen(!isGridOpen)} className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400">
                <i className="fas fa-th"></i>
            </button>
            {isGridOpen && <ModuleManager userProfile={userProfile} onClose={() => setGridOpen(false)} />}
        </div>
        
        <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400">
                <i className="fas fa-bell"></i>
                {hasUnread && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
            </button>
            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-xl shadow-xl border z-10 dark:bg-gray-700 dark:border-gray-600">
                    <div className="p-3 flex justify-between items-center border-b dark:border-gray-600 dark:text-white">
                        <span className="font-bold">Notificações</span>
                        {hasUnread && <button onClick={handleMarkAllAsRead} disabled={isPending} className="text-xs text-royal-blue font-bold disabled:opacity-50">Limpar</button>}
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <p className="font-semibold text-sm dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-royal-blue dark:bg-gray-600 relative overflow-hidden">
                {userProfile.avatarUrl ? (<Image src={userProfile.avatarUrl} alt="Avatar" fill className="object-cover" />) : (<span>{userProfile.fullName?.charAt(0)}</span>)}
            </div>
            <div className="text-left hidden md:block dark:text-white">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate max-w-[100px]">{userProfile.fullName?.split(' ')[0]}</p>
                    <VerificationBadge badge={userProfile.verification_badge} size="10px" />
                </div>
              <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{userProfile.userCategory}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10 dark:bg-gray-700 dark:border-gray-600">
              <ul>
                <li><Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Meu Perfil</Link></li>
                <li><Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Configurações</Link></li>
                <li><Link href="/recursos/ajuda" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Ajuda</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}