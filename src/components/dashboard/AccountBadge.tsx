"use client";

import Image from 'next/image';
import { UserProfile } from '@/app/dashboard/types';
import { VerificationBadge } from '@/components/VerificationBadge';

export default function AccountBadge({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full pr-4 pl-1 py-1 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="relative w-9 h-9">
        {userProfile.avatarUrl ? (
          <Image
            src={userProfile.avatarUrl}
            alt="Avatar"
            fill
            className="rounded-full object-cover border-2 border-white dark:border-gray-600"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-royal-blue to-lavender-blue flex items-center justify-center text-white font-bold text-sm">
            {userProfile.fullName?.charAt(0)}
          </div>
        )}
        {/* Indicador de Status Online (Cosmético) */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
           <span className="text-xs font-bold text-dark-text dark:text-white group-hover:text-royal-blue transition-colors max-w-[100px] truncate">
             {userProfile.fullName?.split(' ')[0]}
           </span>
           <VerificationBadge badge={userProfile.verification_badge} size="10px" />
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wide">
            {userProfile.userCategory || 'Usuário'}
        </span>
      </div>
      
      <i className="fas fa-chevron-down text-[10px] text-gray-400 group-hover:text-royal-blue transition-colors"></i>
    </div>
  );
}