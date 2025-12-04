import React from 'react';

type VerificationBadgeProps = {
  badge: string | null | undefined;
  size?: '4px' | '12px' | '14px';
};

// Define o único ícone padrão de verificação para todos os badges
const VERIFICATION_ICON = 'fa-check-circle';

// --- Lógica de Refatoração e Simplificação ---

// 1. Fonte de Verdade: Definição dos tipos de badges
const BADGE_TYPES = {
  identity: { // Azul - Identidade verificada
    color: 'text-blue-500',
    tooltip: 'Identidade Verificada',
  },
  educator: { // Verde - Educador verificado
    color: 'text-green-500',
    tooltip: 'Educador Verificado',
  },
  official: { // Amarelo - Conta oficial / criador oficial
    color: 'text-yellow-500',
    tooltip: 'Conta Oficial / Criador Oficial',
  },
  featured: { // Vermelho - Contas destaques
    color: 'text-red-500',
    tooltip: 'Conta Destaque',
  },
  legacy: { // Roxo - Usuários legados
    color: 'text-purple-500',
    tooltip: 'Usuário Legado',
  },
} as const;

type BadgeTypeKey = keyof typeof BADGE_TYPES;

// 2. Mapa de Aliases: Resolve strings antigas ou cores para as chaves semânticas
const BADGE_ALIASES: Record<string, BadgeTypeKey> = {
  // Chaves semânticas
  'identity': 'identity',
  'educator': 'educator',
  'official': 'official',
  'featured': 'featured',
  'legacy': 'legacy',
  // Aliases de cores e legado
  'blue': 'identity',
  'verified': 'identity',
  'green': 'educator',
  'red': 'featured',
  'gold': 'official',
  'admin': 'official',
  'purple': 'legacy',
};

// Função de utilidade corrigida para aceitar null/undefined
const getBadgeDetails = (badgeKey: string | null | undefined): (typeof BADGE_TYPES[BadgeTypeKey] & { icon: string }) | null => {
  if (!badgeKey) return null;

  // 1. Limpeza do dado
  const normalizedKey = badgeKey.toLowerCase().trim();
  
  // 2. Resolve o alias
  const primaryKey = BADGE_ALIASES[normalizedKey];

  if (!primaryKey) return null;

  const details = BADGE_TYPES[primaryKey];
  
  return {
    ...details,
    icon: VERIFICATION_ICON,
  };
};

// --- Componente Principal ---

export const VerificationBadge = ({ badge, size = '4px' }: VerificationBadgeProps) => {
  
  const details = getBadgeDetails(badge);

  if (!details) {
    return null;
  }
  
  const sizeClasses = {
      '4px': 'text-[10px]',
      '12px': 'text-xs',
      '14px': 'text-sm'
  };

  const currentSizeClass = sizeClasses[size as keyof typeof sizeClasses] || 'text-xs';

  return (
    <span 
      className={`relative group inline-flex items-center justify-center ml-1 ${details.color} ${currentSizeClass}`}
      title={details.tooltip}
    >
      <i className={`fas ${details.icon}`}></i>
    </span>
  );
};