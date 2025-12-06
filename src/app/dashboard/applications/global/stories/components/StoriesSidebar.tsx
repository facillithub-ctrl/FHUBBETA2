// CAMINHO: src/app/dashboard/applications/global/stories/components/StoriesSidebar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function StoriesSidebar({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'feed'; // 'feed' é o padrão

  const navItems = [
    { id: 'feed', label: 'Feed Geral', icon: 'fas fa-home', color: 'text-blue-500' },
    { id: 'community', label: 'Comunidade', icon: 'fas fa-users', color: 'text-brand-purple' },
    { id: 'book-club', label: 'Clube do Livro', icon: 'fas fa-book-reader', color: 'text-green-500' }, // Atalho para comunidade
    { id: 'events', label: 'Eventos', icon: 'fas fa-calendar-alt', color: 'text-orange-500' },      // Atalho para comunidade
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-80px)] sticky top-24 pr-4 overflow-y-auto custom-scrollbar">
      
      {/* Mini Perfil */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 text-center">
        <div className="relative w-20 h-20 mx-auto mb-3">
             <div className="w-full h-full rounded-full overflow-hidden border-2 border-brand-purple p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                    {user?.avatar_url ? (
                        <Image src={user.avatar_url} fill alt="Avatar" className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300 font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
             </div>
             {user?.is_verified && (
                 <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white" title="Verificado">
                     <i className="fas fa-check"></i>
                 </div>
             )}
        </div>
        <h2 className="font-bold text-gray-800 text-lg leading-tight">{user?.full_name || 'Visitante'}</h2>
        <p className="text-xs text-gray-500 mt-1">@{user?.username || 'usuario'}</p>
        
        <div className="flex gap-4 justify-center mt-4 border-t border-gray-50 pt-3">
             <div className="text-center">
                 <span className="block font-bold text-gray-800 text-sm">{user?.followers || 0}</span>
                 <span className="text-[10px] text-gray-400 uppercase font-bold">Seguidores</span>
             </div>
             <div className="text-center">
                 <span className="block font-bold text-gray-800 text-sm">{user?.following || 0}</span>
                 <span className="text-[10px] text-gray-400 uppercase font-bold">Seguindo</span>
             </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="space-y-1 mb-6">
        <h3 className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Menu</h3>
        {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'book-club' && currentView === 'community') || (item.id === 'events' && currentView === 'community');
            
            // Redirecionamento inteligente: Clube e Eventos vão para a view de comunidade
            const targetView = item.id === 'book-club' || item.id === 'events' ? 'community' : item.id;

            return (
                <Link 
                    key={item.id}
                    href={`/dashboard/applications/global/stories?view=${targetView}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${isActive 
                        ? 'bg-brand-purple/10 text-brand-purple font-bold shadow-sm border border-brand-purple/20' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-white' : 'bg-gray-100'} ${item.color}`}>
                        <i className={item.icon}></i>
                    </div>
                    {item.label}
                </Link>
            );
        })}
      </nav>

      {/* Atalhos de Tópicos (Filtros) */}
      <div className="space-y-1">
        <h3 className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Tópicos em Alta</h3>
        {['#RedaçãoNota1000', '#ClubeDoLivro', '#DicasDeEstudo', '#Tecnologia'].map(tag => (
            <Link 
                key={tag} 
                href={`/dashboard/applications/global/stories?q=${tag.replace('#', '')}`}
                className="block px-4 py-2 text-sm text-gray-500 hover:text-brand-purple hover:bg-purple-50 rounded-lg transition-colors truncate"
            >
                {tag}
            </Link>
        ))}
      </div>

      {/* Footerzinho */}
      <div className="mt-auto pt-6 px-4 text-[10px] text-gray-300 text-center">
        <p>Facillit Stories © 2024</p>
        <p>Feito com ❤️ pela comunidade</p>
      </div>

    </aside>
  );
}