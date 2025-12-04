"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const adminSections = [
    {
        title: "Visão Geral",
        items: [
            { name: 'Dashboard', href: '/admin', icon: 'fa-chart-line' }
        ]
    },
    {
        title: "Gestão Institucional",
        items: [
            { name: 'Instituições', href: '/admin/schools', icon: 'fa-school' },
            // ATUALIZADO: Habilitado para a Gestão Global de Selos (Account)
            { name: 'Usuários & Selos', href: '/admin/users', icon: 'fa-users', disabled: false }, 
        ]
    },
    {
        title: "Módulos Pedagógicos",
        items: [
            // NOTA: O Facillit Write ainda pode ter outras funcionalidades de admin, mas a gestão de selos saiu daqui.
            { name: 'Facillit Write', href: '/admin/write', icon: 'fa-pencil-alt' },
            { name: 'Facillit Test', href: '/admin/test', icon: 'fa-file-alt' },
            { name: 'Facillit Games', href: '/admin/games', icon: 'fa-gamepad', disabled: true },
        ]
    },
    {
        title: "Sistema",
        items: [
            { name: 'Atualizações (Changelog)', href: '/admin/updates', icon: 'fa-bullhorn' },
            { name: 'Configurações', href: '/admin/settings', icon: 'fa-cogs', disabled: true }
        ]
    },
    {
        title: "GPS",
        items: [
            { name: 'GPS', href: '/admin/gps', icon: 'fa-bullhorn' },
        ]
    },
];

type SidebarProps = {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
};

export default function AdminSidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            <div
                onClick={() => setIsMobileOpen(false)}
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
                    isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

            <aside 
                className={`fixed lg:relative top-0 left-0 h-full bg-slate-900 text-white w-64 flex-shrink-0 flex flex-col z-40 transition-transform duration-300
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 border-r border-slate-800 shadow-xl`}
            >
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Admin" width={28} height={28} className="brightness-0 invert" />
                        <span className="font-bold text-lg tracking-wide">Admin</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-white/70 hover:text-white">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    {adminSections.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                                {section.title}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/')); // Adicionado para suportar sub-rotas
                                    return (
                                        <li key={item.name}>
                                            <Link 
                                                href={item.disabled ? '#' : item.href}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                                    ${isActive 
                                                        ? 'bg-royal-blue text-white shadow-md shadow-blue-900/20' 
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                                                    ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-400' : ''}
                                                `}
                                                onClick={item.disabled ? (e) => e.preventDefault() : undefined} // Previne navegação se desabilitado
                                            >
                                                <i className={`fas ${item.icon} w-5 text-center ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}></i>
                                                <span>{item.name}</span>
                                                {item.disabled && <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Em breve</span>}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                     <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <i className="fas fa-sign-out-alt w-5 text-center"></i>
                        <span>Sair do Admin</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}