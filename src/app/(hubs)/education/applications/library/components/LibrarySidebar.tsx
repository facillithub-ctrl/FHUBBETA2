// src/app/dashboard/applications/library/components/LibrarySidebar.tsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibrarySidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ href, icon, label }: { href: string, icon: string, label: string }) => (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(href) 
          ? 'bg-blue-50 text-royal-blue' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col hidden md:flex">
      <div className="p-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Biblioteca
        </h2>
        <nav className="space-y-1">
          <NavItem href="/dashboard/applications/library/discover" icon="fa-compass" label="Descobrir" />
          <NavItem href="/dashboard/applications/library" icon="fa-folder" label="Meu Acervo" />
          <NavItem href="/dashboard/applications/library/recent" icon="fa-clock" label="Recentes" />
          <NavItem href="/dashboard/applications/library/favorites" icon="fa-star" label="Favoritos" />
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Coleções
        </h2>
        <nav className="space-y-1">
          <NavItem href="/dashboard/applications/library/portfolio" icon="fa-briefcase" label="Meu Portfólio" />
          <NavItem href="/dashboard/applications/library/notes" icon="fa-sticky-note" label="Anotações" />
          <NavItem href="/dashboard/applications/library/study-plans" icon="fa-graduation-cap" label="Planos de Estudo" />
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-royal-blue font-semibold mb-1">Armazenamento</p>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
            <div className="bg-royal-blue h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-blue-600">4.5 GB de 10 GB usados</p>
        </div>
      </div>
    </aside>
  );
}