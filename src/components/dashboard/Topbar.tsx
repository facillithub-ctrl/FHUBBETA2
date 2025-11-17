"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/app/dashboard/types';
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
};

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

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
                                ${isSelected ? 'bg-brand-purple text-white border-brand-purple' 
                                            : 'hover:border-brand-purple'}
                                ${isDisabled ? 'bg-gray-100 opacity-60 cursor-not-allowed hover:border-gray-300' : ''}
                            `}
                        >
                             <i className={`fas ${module.icon} text-2xl mb-1 ${isSelected ? 'text-white' : 'text-brand-purple'} ${isDisabled ? '!text-gray-400' : ''}`}></i>
                             <span className="text-xs font-medium">{module.title}</span>
                             {isDisabled && <span className="absolute top-1 right-1 text-[8px] font-bold bg-gray-500 text-white px-1.5 py-0.5 rounded-full">Gestor</span>}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={isPending} className="text-sm font-bold bg-brand-purple text-white py-1 px-3 rounded-md disabled:bg-gray-400">
                    {isPending ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};


export default function Topbar({ userProfile, toggleSidebar }: TopbarProps) {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isGridOpen, setGridOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const { theme, toggleTheme } = useTheme();
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
    // Topbar agora usa as novas cores de fundo
    <header className="bg-bg-primary dark:bg-bg-secondary border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-text-secondary hover:text-brand-purple text-xl lg:hidden">
            <i className="fas fa-bars"></i>
        </button>
        <div className="relative hidden sm:block">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="search" placeholder="Busca universal..." className="w-full max-w-xs bg-bg-secondary dark:bg-bg-primary rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-purple text-text-primary"/>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        
        <button onClick={toggleTheme} className="text-text-secondary hover:text-brand-purple text-xl">
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>
        
        <div className="relative" ref={gridRef}>
            <button onClick={() => setGridOpen(!isGridOpen)} className="text-text-secondary hover:text-brand-purple text-xl">
                <i className="fas fa-th"></i>
            </button>
            {isGridOpen && <ModuleManager userProfile={userProfile} onClose={() => setGridOpen(false)} />}
        </div>
        
        <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative text-text-secondary hover:text-brand-purple text-xl">
                <i className="fas fa-bell"></i>
                {hasUnread && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
            </button>
            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-bg-primary rounded-xl shadow-xl border z-10 dark:bg-bg-secondary dark:border-gray-700">
                    <div className="p-3 flex justify-between items-center border-b dark:border-gray-600 text-text-primary">
                        <span className="font-bold">Notificações</span>
                        {/* *** INÍCIO DA CORREÇÃO *** */}
                        {hasUnread && <button onClick={handleMarkAllAsRead} disabled={isPending} className="text-xs text-brand-purple font-bold disabled:opacity-50">Limpar</button>}
                        {/* *** FIM DA CORREÇÃO *** */}
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <p className="font-semibold text-sm text-text-primary">{n.title}</p>
                                <p className="text-xs text-text-secondary">{n.message}</p>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-sm text-text-secondary">Nenhuma notificação.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>

        <button className="text-text-secondary hover:text-brand-purple text-xl hidden sm:block"><i className="fas fa-comment"></i></button>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-bg-secondary dark:bg-bg-primary flex items-center justify-center font-bold text-brand-purple">
                {userProfile.avatarUrl ? (<Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full" />) : (<span>{userProfile.fullName?.charAt(0) || 'F'}</span>)}
            </div>
            <div className="text-left hidden md:block text-text-primary">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{userProfile.fullName || 'Novo Utilizador'}</p>
                    <VerificationBadge badge={userProfile.verification_badge} size="10px" />
                </div>
              <p className="text-xs text-text-secondary capitalize">{userProfile.userCategory || 'Individual'}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-bg-primary rounded-lg shadow-xl border z-10 dark:bg-bg-secondary dark:border-gray-700">
              <ul>
                <li>
                  <Link 
                    href="/dashboard/account" 
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary dark:hover:bg-gray-800"
                  >
                    Gerenciar Conta
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/recursos/ajuda" 
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary dark:hover:bg-gray-800"
                  >
                    Ajuda
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}