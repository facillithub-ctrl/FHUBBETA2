"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Dados Originais (Preservados) ---
const modulos = {
  "Estudo & Foco": [
    { href: "/modulos/facillit-edu", title: "Facillit Edu", subtitle: "Gestão pedagógica e de alunos." },
    { href: "/modulos/facillit-write", title: "Facillit Write", subtitle: "Escrita com correção de IA." },
    { href: "/modulos/facillit-test", title: "Facillit Test", subtitle: "Criação de simulados e provas." },
    { href: "/modulos/facillit-lab", title: "Facillit Lab", subtitle: "Laboratório virtual com simulações." },
  ],
  "Organização Pessoal": [
    { href: "/modulos/facillit-day", title: "Facillit Day", subtitle: "Agenda, tarefas, finanças e hábitos." },
    { href: "/modulos/facillit-task", title: "Facillit Task", subtitle: "Gestão de tarefas além dos estudos." },
  ],
  "Carreira & Skills": [
    { href: "/modulos/facillit-coach-career", title: "Facillit Coach", subtitle: "Orientação vocacional." },
    { href: "/modulos/facillit-connect", title: "Facillit Connect", subtitle: "Rede social educacional." },
  ],
  "Conteúdo & Criação": [
    { href: "/modulos/facillit-play", title: "Facillit Play", subtitle: "Streaming de videoaulas." },
    { href: "/modulos/facillit-library", title: "Facillit Library", subtitle: "Biblioteca digital e portfólios." },
    { href: "/modulos/facillit-create", title: "Facillit Create", subtitle: "Criação de mapas mentais." },
    { href: "/modulos/facillit-games", title: "Facillit Games", subtitle: "Jogos educacionais." },
  ],
};

const solucoes = [
    { href: "/recursos/sobre-nos", title: "Para Pessoas", subtitle: "Organização e desenvolvimento pessoal." },
    { href: "/recursos/sobre-nos", title: "Para Escolas", subtitle: "Inovação na gestão pedagógica." },
    { href: "/recursos/sobre-nos", title: "Para Empresas", subtitle: "Produtividade e bem-estar corporativo." },
];

const recursos = {
    "Empresa": [
      { href: "/recursos/sobre-nos", title: "Sobre Nós", subtitle: "Conheça nossa história e missão." }, 
      { href: "/recursos/carreiras", title: "Carreiras", subtitle: "Junte-se à nossa equipe." }
    ],
    "Suporte": [
      { href: "/recursos/contato", title: "Contato", subtitle: "Fale com nosso time." }, 
      { href: "/recursos/ajuda", title: "Central de Ajuda", subtitle: "Encontre respostas rápidas." },
      { href: "/recursos/atualizacoes", title: "Atualizações", subtitle: "Veja as novidades da plataforma." }
    ],
    "Legal": [
      { href: "/recursos/uso", title: "Termos de Uso", subtitle: "Nossas políticas e termos." }, 
      { href: "/recursos/privacidade", title: "Política de Privacidade", subtitle: "Como tratamos os seus dados." }
    ],
};

// --- Componentes Auxiliares ---
const DropdownItem = ({ href, title, subtitle }: { href: string; title: string; subtitle: string; }) => (
  <li>
    <Link href={href} className="group flex flex-col p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <strong className="text-sm font-bold text-dark-text group-hover:text-royal-blue transition-colors">{title}</strong>
        <span className="text-xs text-text-muted">{subtitle}</span>
    </Link>
  </li>
);

const DropdownColumn = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode; }) => (
  <div>
    <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-royal-blue uppercase tracking-wider border-b border-gray-100 pb-2">
        <i className={`fas ${icon}`}></i> {title}
    </h5>
    <ul className="space-y-1">{children}</ul>
  </div>
);

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    
    // Lógica original: transparente no topo da home, sólido nas outras ou ao rolar
    if (isHomePage) {
        setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
    } else {
        setScrolled(true);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Fecha menu ao mudar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleMobileDropdown = (key: string) => {
      setActiveMobileDropdown(activeMobileDropdown === key ? null : key);
  };

  // Classes condicionais para manter o estilo original
  const headerContainerClass = isScrolled 
    ? "bg-white/95 shadow-lg backdrop-blur-md border border-gray-100 text-dark-text" 
    : "bg-transparent text-white";
    
  const linkClass = isScrolled ? "text-dark-text hover:text-royal-blue" : "text-white hover:text-white/80";
  const logoClass = isScrolled ? "" : "brightness-0 invert";
  const buttonClass = isScrolled ? "bg-royal-blue text-white" : "bg-white text-royal-blue";
  const navIconClass = isScrolled ? "text-royal-blue" : "text-white";

  return (
    <>
      {/* Header Desktop: Arredondado e Flutuante (Identidade Original) */}
      <header className={`fixed top-0 md:top-5 left-1/2 -translate-x-1/2 z-50 w-full md:w-[95%] md:max-w-[1400px] md:rounded-full transition-all duration-300 ${headerContainerClass}`}>
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className={`relative w-8 h-8 transition-all duration-300 ${logoClass}`}>
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">Facillit Hub</span>
          </Link>
          
          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className={`font-bold text-sm transition-colors ${linkClass}`}>Início</Link>
            
            {/* Dropdown Módulos */}
            <div className="group relative">
              <button className={`font-bold text-sm flex items-center gap-1 transition-colors ${linkClass} py-4`}>
                Módulos <i className={`fas fa-chevron-down text-[10px] ${navIconClass}`}></i>
              </button>
              {/* Mega Menu Restaurado */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 grid grid-cols-4 gap-8 w-[950px] text-left relative">
                    {/* Seta decorativa */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    
                    <DropdownColumn icon="fa-graduation-cap" title="Estudo & Foco">
                        {modulos["Estudo & Foco"].map(item => <DropdownItem key={item.title} {...item} />)}
                    </DropdownColumn>
                    <DropdownColumn icon="fa-calendar-check" title="Organização">
                        {modulos["Organização Pessoal"].map(item => <DropdownItem key={item.title} {...item} />)}
                    </DropdownColumn>
                    <DropdownColumn icon="fa-briefcase" title="Carreira">
                        {modulos["Carreira & Skills"].map(item => <DropdownItem key={item.title} {...item} />)}
                    </DropdownColumn>
                    <DropdownColumn icon="fa-photo-video" title="Criação">
                        {modulos["Conteúdo & Criação"].map(item => <DropdownItem key={item.title} {...item} />)}
                    </DropdownColumn>
                </div>
              </div>
            </div>

            {/* Dropdown Soluções */}
            <div className="group relative">
               <button className={`font-bold text-sm flex items-center gap-1 transition-colors ${linkClass} py-4`}>
                Soluções <i className={`fas fa-chevron-down text-[10px] ${navIconClass}`}></i>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 w-80">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    <DropdownColumn icon="fa-bullseye" title="Nossas Soluções">
                        {solucoes.map(item => <DropdownItem key={item.title} {...item} />)}
                    </DropdownColumn>
                </div>
              </div>
            </div>

            {/* Dropdown Recursos */}
             <div className="group relative">
               <button className={`font-bold text-sm flex items-center gap-1 transition-colors ${linkClass} py-4`}>
                Recursos <i className={`fas fa-chevron-down text-[10px] ${navIconClass}`}></i>
              </button>
              <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 w-[600px]">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 grid grid-cols-3 gap-8 relative">
                     <div className="absolute -top-2 right-10 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                     <DropdownColumn icon="fa-building" title="Empresa">
                        {recursos["Empresa"].map(item => <DropdownItem key={item.title} {...item} />)}
                     </DropdownColumn>
                     <DropdownColumn icon="fa-book" title="Suporte">
                        {recursos["Suporte"].map(item => <DropdownItem key={item.title} {...item} />)}
                     </DropdownColumn>
                     <DropdownColumn icon="fa-file-alt" title="Legal">
                        {recursos["Legal"].map(item => <DropdownItem key={item.title} {...item} />)}
                     </DropdownColumn>
                </div>
              </div>
            </div>
          </nav>
          
          <div className="hidden lg:flex items-center gap-4">
             <Link href="/login" className={`font-bold text-sm transition-colors ${linkClass}`}>Acessar</Link>
             <Link href="/register" className={`py-2.5 px-6 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md ${buttonClass}`}>
                Criar conta
             </Link>
          </div>
          
          {/* Botão Mobile */}
          <button onClick={() => setMenuOpen(!isMenuOpen)} className={`lg:hidden text-2xl focus:outline-none ${linkClass}`}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>
      
      {/* Menu Mobile Otimizado */}
      <div className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col pt-28 px-6 pb-6 overflow-y-auto ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col gap-2">
             <Link href="/" className="py-3 text-lg font-bold text-dark-text border-b border-gray-100">Início</Link>
             
             {/* Acordeão Módulos */}
             <div className="border-b border-gray-100">
                <button onClick={() => toggleMobileDropdown('modulos')} className="w-full flex justify-between items-center py-3 text-lg font-bold text-dark-text">
                    Módulos <i className={`fas fa-chevron-down text-sm transition-transform ${activeMobileDropdown === 'modulos' ? 'rotate-180 text-royal-blue' : 'text-gray-400'}`}></i>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown === 'modulos' ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 pb-4 space-y-4">
                        {Object.entries(modulos).map(([cat, items]) => (
                            <div key={cat}>
                                <h6 className="text-xs font-bold text-royal-blue uppercase mb-2">{cat}</h6>
                                {items.map(item => (
                                    <Link key={item.href} href={item.href} className="block py-2 text-sm text-text-muted border-l-2 border-transparent hover:border-royal-blue hover:text-royal-blue pl-2">
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* Acordeão Soluções */}
             <div className="border-b border-gray-100">
                <button onClick={() => toggleMobileDropdown('solucoes')} className="w-full flex justify-between items-center py-3 text-lg font-bold text-dark-text">
                    Soluções <i className={`fas fa-chevron-down text-sm transition-transform ${activeMobileDropdown === 'solucoes' ? 'rotate-180 text-royal-blue' : 'text-gray-400'}`}></i>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown === 'solucoes' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 pb-4 space-y-2">
                        {solucoes.map(item => (
                            <Link key={item.title} href={item.href} className="block py-2 text-sm text-text-muted">
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
             </div>

             {/* Acordeão Recursos */}
             <div className="border-b border-gray-100">
                <button onClick={() => toggleMobileDropdown('recursos')} className="w-full flex justify-between items-center py-3 text-lg font-bold text-dark-text">
                    Recursos <i className={`fas fa-chevron-down text-sm transition-transform ${activeMobileDropdown === 'recursos' ? 'rotate-180 text-royal-blue' : 'text-gray-400'}`}></i>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown === 'recursos' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-2 pb-4 space-y-4">
                        {Object.entries(recursos).map(([cat, items]) => (
                            <div key={cat}>
                                <h6 className="text-xs font-bold text-royal-blue uppercase mb-2">{cat}</h6>
                                {items.map(item => (
                                    <Link key={item.href} href={item.href} className="block py-2 text-sm text-text-muted hover:text-royal-blue">
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3">
            <Link href="/login" className="w-full py-3 text-center border-2 border-royal-blue text-royal-blue rounded-xl font-bold">Acessar</Link>
            <Link href="/register" className="w-full py-3 text-center bg-royal-blue text-white rounded-xl font-bold shadow-lg">Criar conta</Link>
        </div>
      </div>
    </>
  );
}   