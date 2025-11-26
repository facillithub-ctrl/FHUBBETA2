"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const menuGroups = [
  {
    label: "Principal",
    items: [
      { name: 'Visão Geral', href: '/dashboard', icon: 'fa-th-large' },
      { name: 'Meu Perfil', href: '/dashboard/profile', icon: 'fa-user-circle' }, // Mantido como visualização rápida
    ]
  },
  {
    label: "Aplicações",
    items: [
      { name: 'Facillit Edu', href: '/dashboard/applications/edu', icon: 'fa-graduation-cap' },
      { name: 'Facillit Write', href: '/dashboard/applications/write', icon: 'fa-pen-fancy' },
      { name: 'Facillit Test', href: '/dashboard/applications/test', icon: 'fa-clipboard-check' },
      { name: 'Facillit Play', href: '/dashboard/applications/play', icon: 'fa-play-circle' },
    ]
  },
  {
    label: "Sistema",
    items: [
      { name: 'Facillit Account', href: '/dashboard/account', icon: 'fa-shield-alt' }, // Link direto para Account
      { name: 'Configurações', href: '/dashboard/settings', icon: 'fa-cog' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-100 shadow-2xl lg:shadow-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-gray-50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">Facillit Hub</span>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                          ${isActive 
                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-purple'
                          }`}
                      >
                        <div className={`w-6 flex justify-center transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-purple'}`}>
                          <i className={`fas ${item.icon}`}></i>
                        </div>
                        {item.name}
                        
                        {/* Indicador ativo (bolinha) */}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 mb-2">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs">
                    <i className="fas fa-crown"></i>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-800">Plano Student</p>
                    <p className="text-[10px] text-gray-500">Free Tier</p>
                </div>
             </div>
             <Link href="/precos" className="block w-full py-2 text-center text-xs font-bold bg-white border border-gray-200 rounded-lg text-brand-purple hover:bg-brand-purple hover:text-white transition-colors">
                Fazer Upgrade
             </Link>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}