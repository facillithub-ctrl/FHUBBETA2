import React from 'react';

type VerificationBadgeProps = {
  badge: string | null | undefined;
  size?: '4px' | '12px' | '14px';
};

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
  red: {
    icon: 'fa-star',
    color: 'text-red-500',
    tooltip: 'Aluno Destaque',
  },
  gold: {
    icon: 'fa-crown',
    color: 'text-yellow-500', // Ouro para Admin/Oficial
    tooltip: 'Oficial / Admin',
  },
  admin: { // Fallback para caso esteja salvo como 'admin' no banco
    icon: 'fa-crown',
    color: 'text-yellow-500',
    tooltip: 'Administrador',
  }
};

export const VerificationBadge = ({ badge, size = '4px' }: VerificationBadgeProps) => {
  // Normaliza para minúsculo e remove espaços (ex: "Gold " vira "gold")
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
      
      {/* Tooltip Hover (Opcional, pois o title já ajuda) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {details.tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </span>
  );
};