"use client";

import Link from 'next/link';
import type { UserProfile } from '../../types';

type Props = {
  userProfile: UserProfile;
};

// Componente para os cartões de "Acesso Rápido"
const AdminQuickAccessCard = ({ title, description, icon, href }: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) => (
  <Link 
    href={href}
    className="w-full flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
  >
    <i className={`fas ${icon} w-8 text-center text-xl text-brand-purple`}></i>
    <div className="ml-4 text-left">
      <h4 className="font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <i className="fas fa-chevron-right text-text-secondary ml-auto"></i>
  </Link>
);

/**
 * ETAPA 10 do Plano (Admin Center)
 */
export default function AccountAdminCenter({ userProfile }: Props) {
  
  // Determina para onde o link de gestão deve ir
  const managementLink = userProfile.userCategory === 'administrator' 
    ? '/admin/schools' 
    : '/dashboard/applications/edu'; // 'diretor' usa o Edu

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Admin Center</h2>
      <p className="text-text-secondary mb-8">
        Gestão da sua organização ({userProfile.schoolName || 'Facillit Hub'}).
      </p>

      {/* Secção 10.1: Gestão Institucional */}
      <div className="pb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Gestão Institucional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminQuickAccessCard
            title="Gerenciar Usuários e Turmas"
            description="Adicionar, remover ou editar utilizadores e turmas."
            icon="fa-users-cog"
            href={managementLink}
          />
          <AdminQuickAccessCard
            title="Gerenciar Licenças"
            description="Ver o estado das suas licenças ativas."
            icon="fa-id-badge"
            href="#"
          />
          <AdminQuickAccessCard
            title="Gerenciar Permissões"
            description="Definir papéis e acessos (em breve)."
            icon="fa-user-shield"
            href="#"
          />
        </div>
      </div>

      {/* Secção 10.2: Dashboards */}
      <div className="py-8 border-t dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Dashboards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminQuickAccessCard
            title="Desempenho (Students)"
            description="Ver a evolução académica das turmas."
            icon="fa-chart-line"
            href="#"
          />
           <AdminQuickAccessCard
            title="Engajamento (Enterprise)"
            description="Ver a utilização da plataforma."
            icon="fa-chart-pie"
            href="#"
          />
        </div>
      </div>
    </div>
  );
}