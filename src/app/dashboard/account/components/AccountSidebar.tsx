"use client";

import Image from "next/image";

type NavLink = {
  id: string;
  title: string;
  icon: string;
  section: 'account' | 'ecosystem' | 'admin';
};

// Baseado no seu PDF e no exemplo da Google
const navLinks: NavLink[] = [
  // 1. ADICIONADO O "INÍCIO"
  { id: 'home', title: 'Início', icon: 'fa-home', section: 'account' },
  { id: 'profile', title: 'Perfil e Informações', icon: 'fa-user-circle', section: 'account' },
  { id: 'security', title: 'Segurança e Acesso', icon: 'fa-shield-alt', section: 'account' },
  { id: 'billing', title: 'Pagamentos e Assinaturas', icon: 'fa-credit-card', section: 'account' },
  { id: 'privacy', title: 'Privacidade e Dados', icon: 'fa-lock', section: 'account' },
  { id: 'devices', title: 'Dispositivos', icon: 'fa-desktop', section: 'account' },
  { id: 'modules', title: 'Módulos e Integrações', icon: 'fa-puzzle-piece', section: 'ecosystem' },
  { id: 'sharing', title: 'Pessoas e Compartilhamento', icon: 'fa-users', section: 'ecosystem' },
  { id: 'smart_profile', title: 'Meu Perfil Inteligente', icon: 'fa-brain', section: 'ecosystem' },
  { id: 'admin_center', title: 'Admin Center', icon: 'fa-user-shield', section: 'admin' },
];

// Componente do Botão de Navegação
const NavButton = ({ link, isActive, onClick }: {
  link: NavLink;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
      ${isActive
        ? 'bg-brand-purple/10 text-brand-purple' // Estilo ativo
        : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800' // Estilo inativo
      }
    `}
  >
    <i className={`fas ${link.icon} w-5 text-center`}></i>
    <span>{link.title}</span>
  </button>
);

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function AccountSidebar({ activeTab, setActiveTab }: Props) {
  return (
    <nav className="bg-bg-primary dark:bg-bg-secondary p-4 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 px-2 pb-4 mb-4 border-b dark:border-gray-700">
        <Image 
          src="/assets/images/accont.svg" 
          alt="Facillit Account" 
          width={120} 
          height={25}
          className="dark:invert dark:opacity-80"
        />
      </div>
      
      <div className="space-y-4">
        {/* Secção: Conta */}
        <div>
          <h4 className="text-xs font-semibold text-text-secondary uppercase px-4 mb-2">Conta</h4>
          <div className="space-y-1">
            {navLinks.filter(l => l.section === 'account').map(link => (
              <NavButton 
                key={link.id} 
                link={link} 
                isActive={activeTab === link.id} 
                onClick={() => setActiveTab(link.id)} 
              />
            ))}
          </div>
        </div>

        {/* Secção: Ecossistema */}
        <div>
          <h4 className="text-xs font-semibold text-text-secondary uppercase px-4 mb-2">Ecossistema</h4>
          <div className="space-y-1">
            {navLinks.filter(l => l.section === 'ecosystem').map(link => (
              <NavButton 
                key={link.id} 
                link={link} 
                isActive={activeTab === link.id} 
                onClick={() => setActiveTab(link.id)} 
              />
            ))}
          </div>
        </div>
        
        {/* Secção: Admin (condicional) */}
        {/* (Adicionaremos a lógica para mostrar/ocultar isto mais tarde) */}
        <div>
          <h4 className="text-xs font-semibold text-text-secondary uppercase px-4 mb-2">Gestão</h4>
          <div className="space-y-1">
            {navLinks.filter(l => l.section === 'admin').map(link => (
              <NavButton 
                key={link.id} 
                link={link} 
                isActive={activeTab === link.id} 
                onClick={() => setActiveTab(link.id)} 
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}