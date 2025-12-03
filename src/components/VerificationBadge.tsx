import React from 'react';

type VerificationBadgeProps = {
  badge: string | null | undefined;
  size?: '4px' | '12px' | '14px';
};

// Mapa de badges aceitos e suas cores
const badgeDetails: Record<string, { icon: string; color: string; tooltip: string }> = {
  green: {
      icon: 'fa-check-circle',
      color: 'text-green-500',
      tooltip: 'Professor Verificado',
  },
  blue: {
    icon: 'fa-check-circle',
    color: 'text-blue-500',
    tooltip: 'Identidade Verificada',
  },
  // ADICIONADO: Alias comum para garantir compatibilidade com valores como 'verified'
  verified: { 
    icon: 'fa-check-circle', 
    color: 'text-blue-500', 
    tooltip: 'Conta Verificada' 
  },
  red: {
    icon: 'fa-star',
    color: 'text-red-500',
    tooltip: 'Aluno Destaque',
  },
  gold: {
    icon: 'fa-crown',
    color: 'text-yellow-500',
    tooltip: 'Oficial / Admin',
  },
  // Alias para gold
  admin: {
    icon: 'fa-crown',
    color: 'text-yellow-500',
    tooltip: 'Administrador',
  }
};

export const VerificationBadge = ({ badge, size = '4px' }: VerificationBadgeProps) => {
  // 1. Limpeza do dado que vem do banco
  const badgeKey = badge?.toLowerCase().trim();

  if (!badgeKey || !badgeDetails[badgeKey]) {
    return null;
  }

  const details = badgeDetails[badgeKey];
  
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