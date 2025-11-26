"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// --- Estrutura de Dados ---

const ecossistema = {
  "For Students": [
    { title: "Facillit Write", href: "/modulos/facillit-write", desc: "Redação e correção IA", icon: "fa-pen-fancy" },
    { title: "Facillit Day", href: "/modulos/facillit-day", desc: "Agenda e Hábitos", icon: "fa-calendar-alt" },
    { title: "Facillit Test", href: "/modulos/facillit-test", desc: "Simulados e Provas", icon: "fa-clipboard-check" },
    { title: "Facillit Play", href: "/modulos/facillit-play", desc: "Streaming Educacional", icon: "fa-play-circle" },
    { title: "Facillit Games", href: "/modulos/facillit-games", desc: "Aprendizagem lúdica", icon: "fa-gamepad" },
    { title: "Facillit Library", href: "/modulos/facillit-library", desc: "Biblioteca digital", icon: "fa-book-reader" },
    { title: "Facillit Create", href: "/modulos/facillit-create", desc: "Mapas mentais", icon: "fa-project-diagram" },
  ],
  "For Schools": [
    { title: "Facillit Edu", href: "/modulos/facillit-edu", desc: "Gestão Pedagógica", icon: "fa-school" },
    { title: "Facillit Lab", href: "/modulos/facillit-lab", desc: "Laboratório Virtual", icon: "fa-flask" },
  ],
  "For Enterprise": [
    { title: "Facillit Access", href: "/modulos/facillit-access", desc: "Gestão de Acessos", icon: "fa-id-badge" },
    { title: "Facillit Center", href: "/modulos/facillit-center", desc: "Central de Operações", icon: "fa-network-wired" },
    { title: "Facillit People", href: "/modulos/facillit-people", desc: "Gestão de RH", icon: "fa-users-cog" },
    { title: "Facillit Card", href: "/modulos/facillit-card", desc: "Benefícios", icon: "fa-credit-card" },
    { title: "Facillit API", href: "/modulos/facillit-api", desc: "Integração", icon: "fa-code" },
    { title: "Facillit Finances", href: "/modulos/facillit-finances", desc: "Gestão Financeira", icon: "fa-chart-line" },
  ],
  "Global": [
    { title: "Facillit Global", href: "/solucoes/global", desc: "Conexão mundial", icon: "fa-globe-americas" },
  ]
};

const recursos = [
  { title: "Avisos Legais", href: "/recursos/legal", icon: "fa-scale-balanced" },
  { title: "Acessibilidade", href: "/recursos/acessibilidade", icon: "fa-universal-access" },
  { title: "Trabalhe Conosco", href: "/recursos/carreiras", icon: "fa-briefcase" },
  { title: "Blog", href: "/recursos/blog", icon: "fa-newspaper" },
];

const suporte = [
  { title: "Fale Conosco", href: "/recursos/contato", icon: "fa-headset" },
  { title: "FAQ", href: "/recursos/ajuda", icon: "fa-question-circle" },
  { title: "Vendas", href: "/recursos/vendas", icon: "fa-handshake" },
  { title: "Facillit Account", href: "/dashboard/account", icon: "fa-user-shield", highlight: true }, 
];

// --- Componente Mobile ---
const MobileAccordion = ({ title, isOpen, toggle, children }: { title: string, isOpen: boolean, toggle: () => void, children: React.ReactNode }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button onClick={toggle} className="flex items-center justify-between w-full py-4 text-left group">
      <span className={`font-bold text-base transition-colors ${isOpen ? 'text-brand-purple' : 'text-gray-800'}`}>{title}</span>
      <i className={`fas fa-chevron-down transition-transform duration-300 text-xs ${isOpen ? 'rotate-180 text-brand-purple' : 'text-gray-400'}`}></i>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
      <div className="pl-2">{children}</div>
    </div>
  </div>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    if (isHome) {
        setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
    } else {
        setIsScrolled(false); // Nas outras páginas não precisamos de detetar scroll para mudar cor, pois é estático
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMobileSection(null);
  }, [pathname]);

  // --- Lógica de Posicionamento e Estilo ---
  
  // 1. Posicionamento: Fixed na Home (segue o scroll), Absolute nas outras (fica no topo)
  const positionClass = isHome ? "fixed" : "absolute";
  
  // 2. Estilo Visual do Container
  // Home com Scroll ou Menu Aberto -> Branco/Glass
  // Home no Topo -> Levemente transparente (mas com texto preto como pedido)
  // Outras Páginas -> Sempre Branco/Glass para garantir leitura
  const visualClass = (isHome && isScrolled) || mobileMenuOpen || !isHome
    ? "bg-white/95 backdrop-blur-md border border-gray-200 shadow-sm py-3"
    : "bg-white/80 backdrop-blur-sm border border-transparent py-5"; // Home Topo (com fundo leve para contraste)

  // Texto sempre escuro conforme pedido
  const linkColor = "text-gray-800 hover:text-brand-purple";
  const chevronColor = "text-brand-purple";

  return (
    <>
      <header className={`${positionClass} top-0 left-0 w-full z-50 flex justify-center font-inter`}>
        <div className={`w-full md:w-[95%] max-w-[1400px] transition-all duration-500 ease-out md:mt-4 md:rounded-full px-6 ${visualClass}`}>
          <div className="flex items-center justify-between">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 group z-50 relative">
                <div className="relative w-8 h-8 transition-all duration-300">
                    <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub" fill className="object-contain" />
                </div>
                <span className={`font-bold text-xl tracking-tight transition-colors ${linkColor}`}>Facillit Hub</span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className={`text-sm font-bold uppercase tracking-wide transition-colors ${linkColor}`}>Início</Link>

              {/* MEGA MENU ECOSSISTEMA (Fixed Center) */}
              <div className="group">
                <button className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide py-4 transition-colors ${linkColor}`}>
                  Ecossistema <i className={`fas fa-chevron-down text-[10px] ${chevronColor}`}></i>
                </button>
                
                {/* Dropdown Centralizado na Tela (Fixed) */}
                <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[95vw] max-w-[1100px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40">
                  {/* Área de ponte para não perder o hover */}
                  <div className="absolute -top-6 left-0 w-full h-6 bg-transparent"></div>
                  
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 grid grid-cols-4 gap-8 relative">
                    {/* Seta Decorativa Centralizada no Menu (estética) */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>

                    {Object.entries(ecossistema).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-xs font-black text-brand-purple uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{category}</h3>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.title}>
                                        <Link href={item.href} className="group/link flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-all">
                                            <div className="mt-1 text-brand-green group-hover/link:text-brand-purple transition-colors min-w-[20px] text-center">
                                                <i className={`fas ${item.icon}`}></i>
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-gray-700 group-hover/link:text-brand-purple transition-colors">{item.title}</span>
                                                <span className="text-[10px] text-gray-400 group-hover/link:text-gray-500 leading-tight block mt-0.5">{item.desc}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/precos" className={`text-sm font-bold uppercase tracking-wide transition-colors ${linkColor}`}>Preços</Link>

              {/* RECURSOS DROPDOWN */}
              <div className="group relative">
                <button className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide py-4 transition-colors ${linkColor}`}>
                  Recursos <i className={`fas fa-chevron-down text-[10px] ${chevronColor}`}></i>
                </button>
                {/* Absolute funciona bem aqui pois o menu é pequeno, mas fixed garante z-index */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-60">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 relative">
                     <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    {recursos.map(item => (
                        <Link key={item.title} href={item.href} className="flex items-center gap-3 p-3 text-sm font-medium text-gray-600 hover:text-brand-purple hover:bg-gray-50 rounded-xl transition-colors">
                            <i className={`fas ${item.icon} w-4 text-center text-brand-green/70`}></i>
                            {item.title}
                        </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* SUPORTE DROPDOWN */}
              <div className="group relative">
                <button className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide py-4 transition-colors ${linkColor}`}>
                  Suporte <i className={`fas fa-chevron-down text-[10px] ${chevronColor}`}></i>
                </button>
                <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-64">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 relative">
                    <div className="absolute -top-2 right-8 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    {suporte.map(item => (
                        <Link key={item.title} href={item.href} className={`flex items-center gap-3 p-3 text-sm font-medium rounded-xl transition-colors ${item.highlight ? 'bg-brand-purple/5 text-brand-purple hover:bg-brand-purple/10' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
                            <i className={`fas ${item.icon} w-4 text-center ${item.highlight ? 'text-brand-purple' : 'text-brand-green/70'}`}></i>
                            {item.title}
                        </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* LOGIN BUTTONS */}
            <div className="hidden lg:flex items-center gap-3">
                <Link href="/login" className={`text-sm font-bold px-5 py-2.5 rounded-lg transition-colors hover:bg-gray-100 ${linkColor}`}>
                    Entrar
                </Link>
                <Link href="/register" className="bg-brand-gradient text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
                    Criar Conta
                </Link>
            </div>

            {/* MOBILE TOGGLE */}
            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden text-2xl focus:outline-none transition-colors text-brand-purple z-50`}
            >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out lg:hidden flex flex-col pt-28 px-6 pb-6 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-2 pb-20">
            <Link href="/" className="py-3 text-lg font-bold text-brand-purple border-b border-gray-100">Início</Link>
            
            <MobileAccordion title="Ecossistema" isOpen={activeMobileSection === 'eco'} toggle={() => setActiveMobileSection(activeMobileSection === 'eco' ? null : 'eco')}>
                {Object.entries(ecossistema).map(([cat, items]) => (
                    <div key={cat} className="mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 mt-2 pl-2">{cat}</h4>
                        {items.map(item => (
                            <Link key={item.title} href={item.href} className="flex items-center gap-3 py-2 pl-2 text-gray-600 hover:text-brand-purple">
                                <i className={`fas ${item.icon} w-5 text-brand-green`}></i>
                                <span className="text-sm font-medium">{item.title}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </MobileAccordion>

            <Link href="/precos" className="py-3 text-lg font-bold text-gray-800 border-b border-gray-100">Preços</Link>

            <MobileAccordion title="Recursos" isOpen={activeMobileSection === 'rec'} toggle={() => setActiveMobileSection(activeMobileSection === 'rec' ? null : 'rec')}>
                {recursos.map(item => (
                    <Link key={item.title} href={item.href} className="flex items-center gap-3 py-3 pl-2 text-gray-600">
                        <i className={`fas ${item.icon} w-5 text-brand-green`}></i>
                        {item.title}
                    </Link>
                ))}
            </MobileAccordion>

            <MobileAccordion title="Suporte" isOpen={activeMobileSection === 'sup'} toggle={() => setActiveMobileSection(activeMobileSection === 'sup' ? null : 'sup')}>
                {suporte.map(item => (
                    <Link key={item.title} href={item.href} className="flex items-center gap-3 py-3 pl-2 text-gray-600">
                        <i className={`fas ${item.icon} w-5 text-brand-green`}></i>
                        {item.title}
                    </Link>
                ))}
            </MobileAccordion>
        </div>

        <div className="mt-auto flex flex-col gap-3">
            <Link href="/login" className="w-full py-3.5 text-center border-2 border-brand-purple text-brand-purple rounded-xl font-bold">Entrar</Link>
            <Link href="/register" className="w-full py-3.5 text-center bg-brand-gradient text-white rounded-xl font-bold shadow-lg">Criar Conta</Link>
        </div>
      </div>
    </>
  );
}