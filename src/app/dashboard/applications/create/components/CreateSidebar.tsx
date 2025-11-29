'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Layout, FileText, Star, Clock, 
  Settings, Palette, FolderOpen 
} from 'lucide-react';

export default function CreateSidebar() {
  const pathname = usePathname();
  const isEditor = pathname.includes('/create/') && pathname.split('/').length > 5; // Detecção simples se está dentro de um doc

  return (
    <div className="h-full flex flex-col p-4">
      {/* Cabeçalho da Sidebar */}
      <div className="mb-8 mt-2 flex items-center gap-2 px-2">
        <div className="bg-brand-purple/10 p-2 rounded-lg text-brand-purple">
          <Palette size={24} />
        </div>
        <span className="font-multiara text-2xl text-gray-800">Estúdio</span>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 space-y-1">
        <SidebarItem 
          icon={<Layout size={18} />} 
          label="Meus Resumos" 
          href="/dashboard/applications/create" 
          active={pathname === '/dashboard/applications/create'}
        />
        <SidebarItem 
          icon={<Clock size={18} />} 
          label="Recentes" 
          href="/dashboard/applications/create?filter=recent" 
        />
        <SidebarItem 
          icon={<Star size={18} />} 
          label="Favoritos" 
          href="/dashboard/applications/create?filter=favorites" 
        />
        
        <div className="my-4 border-t border-gray-100" />
        
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Templates
        </p>
        
        <SidebarItem icon={<FileText size={18} />} label="Método Cornell" href="#" />
        <SidebarItem icon={<FileText size={18} />} label="Mapa Mental" href="#" />
        <SidebarItem icon={<FileText size={18} />} label="Flashcards" href="#" />
      </nav>

      {/* Configurações (Só aparece se estiver no editor, opcional) */}
      {isEditor && (
        <div className="mt-auto bg-purple-50 rounded-xl p-4 mb-4">
          <h4 className="font-dk-lemons text-sm text-purple-900 mb-2">Papelaria</h4>
          <div className="flex gap-2">
             <button className="w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm" title="Branco"></button>
             <button className="w-6 h-6 rounded-full bg-[#fdfbf7] border border-gray-200 shadow-sm" title="Creme"></button>
             <button className="w-6 h-6 rounded-full bg-slate-900 border border-gray-200 shadow-sm" title="Dark Mode"></button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4">
        <SidebarItem icon={<Settings size={18} />} label="Configurações" href="/dashboard/settings" />
      </div>
    </div>
  );
}

// Componente Auxiliar de Item de Menu
function SidebarItem({ icon, label, href, active }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-purple-50 text-brand-purple' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      {icon}
      <span className="font-letters text-base pt-1">{label}</span>
    </Link>
  );
}