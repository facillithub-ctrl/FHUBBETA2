import React from 'react';

type VerificationBadgeProps = {
  badge: string | null | undefined;
  size?: '4px' | '12px' | '14px';
};

// Define o único ícone padrão de verificação para todos os badges, conforme solicitado.
const VERIFICATION_ICON = 'fa-check-circle'; // Ícone de Check (Verificado)

// --- Lógica de Refatoração e Simplificação ---

// 1. Fonte de Verdade: Definição dos tipos de badges (chaves semânticas)
// Isso elimina a repetição de ícones e centraliza as definições de cor e tooltip.
const BADGE_TYPES = {
  identity: { // Azul - Identidade verificada
    color: 'text-blue-500',
    tooltip: 'Identidade Verificada',
  },
  educator: { // Verde - Educador verificado (substitui o antigo 'Professor Verificado')
    color: 'text-green-500',
    tooltip: 'Educador Verificado',
  },
  official: { // Amarelo - Conta oficial / criador oficial (substitui 'Oficial/Admin' e 'gold')
    color: 'text-yellow-500',
    tooltip: 'Conta Oficial / Criador Oficial',
  },
  featured: { // Vermelho - Contas destaques (substitui o antigo 'Aluno Destaque')
    color: 'text-red-500',
    tooltip: 'Conta Destaque',
  },
  legacy: { // Roxo - Usuários legados (Novo tipo de badge)
    color: 'text-purple-500',
    tooltip: 'Usuário Legado',
  },
} as const;

type BadgeTypeKey = keyof typeof BADGE_TYPES;

// 2. Mapa de Aliases: Resolve qualquer string de entrada (antiga ou baseada em cor)
// para uma das chaves semânticas primárias definidas em BADGE_TYPES.
const BADGE_ALIASES: Record<string, BadgeTypeKey> = {
  // Chaves semânticas (para evitar falha de lookup se o valor for exato)
  'identity': 'identity',
  'educator': 'educator',
  'official': 'official',
  'featured': 'featured',
  'legacy': 'legacy',
  // Aliases de cores e chaves antigas (mantém a compatibilidade)
  'blue': 'identity',
  'verified': 'identity',
  'green': 'educator',
  'red': 'featured',
  'gold': 'official',
  'admin': 'official',
  'purple': 'legacy',
};

// Função de utilidade para buscar os detalhes do badge de forma robusta e simples
const getBadgeDetails = (badgeKey: string | undefined): (typeof BADGE_TYPES[BadgeTypeKey] & { icon: string }) | null => {
  if (!badgeKey) return null;

  // 1. Limpeza do dado que vem do banco
  const normalizedKey = badgeKey.toLowerCase().trim();
  
  // 2. Resolve o alias para a chave primária
  const primaryKey = BADGE_ALIASES[normalizedKey];

  if (!primaryKey) return null;

  const details = BADGE_TYPES[primaryKey];
  
  // Retorna os detalhes juntamente com o ícone padrão
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