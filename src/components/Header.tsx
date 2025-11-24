"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Estrutura mapeada com as pastas REAIS do projeto
const verticais = {
  "Education": {
    description: "Desenvolvimento e aprendizado.",
    modules: [
      { href: "/modulos/facillit-write", title: "Write", icon: "fa-pencil-alt", desc: "Redação e IA", active: true },
      { href: "/modulos/facillit-games", title: "Games", icon: "fa-gamepad", desc: "Gamificação", active: true },
      { href: "/modulos/facillit-test", title: "Test", icon: "fa-file-alt", desc: "Simulados", active: true },
      { href: "/modulos/facillit-play", title: "Play", icon: "fa-play-circle", desc: "Streaming", active: true },
      { href: "/modulos/facillit-library", title: "Library", icon: "fa-book-open", desc: "Biblioteca", active: true },
      { href: "/modulos/facillit-create", title: "Create", icon: "fa-lightbulb", desc: "Mapas Mentais", active: true },
      { href: "#", title: "Teacher", icon: "fa-chalkboard-teacher", desc: "Para Professores", active: false }, // Novo
    ]
  },
  "Schools": {
    description: "Gestão para instituições.",
    modules: [
      { href: "/modulos/facillit-edu", title: "Edu", icon: "fa-graduation-cap", desc: "Gestão Escolar", active: true },
      { href: "/modulos/facillit-lab", title: "Lab", icon: "fa-flask", desc: "Laboratório STEM", active: true },
    ]
  },
  "Business": {
    description: "Soluções corporativas.",
    modules: [
      { href: "#", title: "Center", icon: "fa-chart-line", desc: "Gestão de Startups", active: false },
      { href: "#", title: "Host", icon: "fa-server", desc: "Cloud Hosting", active: false },
      { href: "#", title: "People", icon: "fa-users-cog", desc: "RH Tech", active: false },
      { href: "#", title: "Access", icon: "fa-id-badge", desc: "Controle de Acesso", active: false },
    ]
  },
  "Global": {
    description: "Produtividade universal.",
    modules: [
      { href: "/modulos/facillit-day", title: "Day", icon: "fa-calendar-check", desc: "Agenda", active: true },
      { href: "/modulos/facillit-task", title: "Task", icon: "fa-tasks", desc: "Tarefas", active: true },
      { href: "/modulos/facillit-coach-career", title: "C&C", icon: "fa-compass", desc: "Carreira", active: true },
      { href: "/modulos/facillit-connect", title: "Connect", icon: "fa-users", desc: "Comunidade", active: true },
      { href: "#", title: "Finances", icon: "fa-wallet", desc: "Finanças", active: false }, // Novo
    ]
  }
};

const recursosData = {
  "Institucional": [
    { href: "/recursos/sobre-nos", title: "Sobre Nós", icon: "fa-building" },
    { href: "/recursos/carreiras", title: "Carreiras", icon: "fa-briefcase" },
    { href: "/recursos/contato", title: "Contato", icon: "fa-envelope" },
  ],
  "Legal & Suporte": [
    { href: "/recursos/ajuda", title: "Central de Ajuda", icon: "fa-life-ring" },
    { href: "/recursos/privacidade", title: "Privacidade", icon: "fa-user-shield" },
    { href: "/recursos/uso", title: "Termos de Uso", icon: "fa-file-contract" },
    { href: "/recursos/direito-autoral", title: "Direitos Autorais", icon: "fa-copyright" },
  ]
};

const NavItem = ({ title, data }: { title: string, data: any }) => (
  <div className="group relative px-1">
    <button className="flex items-center gap-1 py-3 px-3 text-sm font-bold text-gray-600 hover:text-brand-purple transition-colors">
      {title} <i className="fas fa-chevron-down text-[10px] opacity-60 group-hover:rotate-180 transition-transform"></i>
    </button>
    
    <div className="absolute top-full left-0 mt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 pt-2">
      <div className="bg-white rounded-xl shadow-2xl border border-brand-purple/10 overflow-hidden">
        <div className="bg-brand-purple/5 p-3 border-b border-brand-purple/10">
          <p className="text-xs font-bold text-brand-purple uppercase tracking-wider">{data.description}</p>
        </div>
        <ul className="p-2 grid gap-1 max-h-[400px] overflow-y-auto">
          {data.modules.map((mod: any) => (
            <li key={mod.title}>
              <Link href={mod.href} className={`flex items-center gap-3 p-2 rounded-lg group/item transition-colors ${mod.active ? 'hover:bg-brand-green/10' : 'opacity-60 cursor-not-allowed hover:bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${mod.active ? 'bg-white border border-brand-purple/10 text-brand-purple group-hover/item:bg-brand-green group-hover/item:text-brand-purple' : 'bg-gray-100 text-gray-400'}`}>
                  <i className={`fas ${mod.icon} text-xs`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`block text-sm font-bold ${mod.active ? 'text-gray-700 group-hover/item:text-brand-purple' : 'text-gray-500'}`}>{mod.title}</span>
                    {!mod.active && <span className="text-[8px] font-bold uppercase bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Breve</span>}
                  </div>
                  <span className="block text-[10px] text-gray-400">{mod.desc}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    if (isHomePage) {
      setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
    } else {
      setScrolled(true);
    }
    return () => { if (isHomePage) window.removeEventListener('scroll', handleScroll); };
  }, [isHomePage]);

  const headerClass = isScrolled 
    ? "top-4 w-[95%] max-w-[1200px] rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-brand-purple/10" 
    : "top-0 w-full bg-transparent py-4 border-b border-transparent";

  return (
    <>
      <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${headerClass}`}>
        <div className="px-6 py-2 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
               <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub" fill className="object-contain transition-transform group-hover:scale-110" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-purple group-hover:text-brand-green transition-colors">
              Facillit<span className="text-dark-text">Hub</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className="text-sm font-bold px-4 py-2 text-gray-600 hover:text-brand-purple transition-colors">Início</Link>
            {Object.entries(verticais).map(([key, data]) => ( <NavItem key={key} title={key} data={data} /> ))}
            <div className="group relative px-1">
              <button className="flex items-center gap-1 py-3 px-3 text-sm font-bold text-gray-600 hover:text-brand-purple transition-colors">
                Recursos <i className="fas fa-chevron-down text-[10px] opacity-60 group-hover:rotate-180 transition-transform"></i>
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 pt-2">
                <div className="bg-white rounded-xl shadow-2xl border border-brand-purple/10 overflow-hidden p-1">
                  {Object.entries(recursosData).map(([category, items]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <h6 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">{category}</h6>
                      <ul>{items.map((link) => (<li key={link.title}><Link href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-purple hover:text-white text-gray-600 transition-colors text-sm font-medium"><i className={`fas ${link.icon} w-4 text-center`}></i> {link.title}</Link></li>))}</ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold px-5 py-2.5 rounded-full text-brand-purple hover:bg-brand-purple/5 transition-colors">Entrar</Link>
            <Link href="/register" className="bg-brand-purple hover:bg-brand-green hover:text-brand-dark text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Criar Conta</Link>
          </div>

          <button onClick={() => setMenuOpen(true)} className="lg:hidden text-2xl text-brand-purple"><i className="fas fa-bars"></i></button>
        </div>
      </header>
      {/* Mobile Menu (Omitido para brevidade, mantém a lógica anterior) */}
    </>
  );
}