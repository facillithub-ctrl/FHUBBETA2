import React from 'react';

type VerificationBadgeProps = {
  badge: string | null | undefined;
  size?: '4px' | '12px';
};

const badgeDetails = {
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
};

export const VerificationBadge = ({ badge, size = '4px' }: VerificationBadgeProps) => {
  if (!badge || !badgeDetails[badge as keyof typeof badgeDetails]) {
    return null;
  }

  const details = badgeDetails[badge as keyof typeof badgeDetails];
  const sizeClass = size === '4px' ? 'text-sm' : 'text-base';

  return (
    <span className={`relative group inline-flex items-center ${details.color} ${sizeClass}`}>
      <i className={`fas ${details.icon}`}></i>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {details.tooltip}
      </div>
    </span>
  );
};