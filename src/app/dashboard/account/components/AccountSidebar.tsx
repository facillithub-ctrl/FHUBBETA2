"use client";

import Image from 'next/image';

interface AccountSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export default function AccountSidebar({ activeTab, setActiveTab, isAdmin }: AccountSidebarProps) {
  
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: 'fas fa-home' },
    { id: 'profile', label: 'Editar Perfil', icon: 'fas fa-user-edit' },
    { id: 'smart-profile', label: 'Perfil Inteligente', icon: 'fas fa-id-card' },
    { id: 'security', label: 'Segurança', icon: 'fas fa-shield-alt' },
    { id: 'privacy', label: 'Privacidade', icon: 'fas fa-user-secret' },
    { id: 'devices', label: 'Dispositivos', icon: 'fas fa-mobile-alt' },
    { id: 'modules', label: 'Módulos Ativos', icon: 'fas fa-cubes' },
    { id: 'sharing', label: 'Compartilhamento', icon: 'fas fa-share-alt' },
    { id: 'billing', label: 'Faturamento', icon: 'fas fa-credit-card' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Center', icon: 'fas fa-cogs' });
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 h-full sticky top-6">
      
      {/* HEADER DA SIDEBAR COM LOGO ACCOUNT */}
      <div className="mb-8 px-2 flex items-center gap-3">
         <div className="relative w-10 h-10 shrink-0">
            <Image 
                src="/assets/images/accont.svg"
                alt="Facillit Account"
                fill
                className="object-contain"
            />
         </div>
         <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">Minha Conta</h2>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Facillit Hub</span>
         </div>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <i className={`${item.icon} w-5 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 px-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 pl-2">Suporte</p>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-brand-purple transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400">
              <i className="far fa-question-circle w-5 text-center"></i>
              Central de Ajuda
          </button>
      </div>
    </div>
  );
}