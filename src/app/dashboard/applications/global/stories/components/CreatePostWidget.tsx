// CAMINHO: src/app/dashboard/applications/global/stories/components/CreatePostWidget.tsx
"use client";

import Image from 'next/image';
import { UserProfile } from '../types';

export default function CreatePostWidget({ 
  currentUser, 
  onOpenReviewModal 
}: { 
  currentUser: UserProfile, 
  onOpenReviewModal: () => void 
}) {
  return (
    <div className="bg-white rounded-3xl p-4 mb-6 flex gap-4 items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-100">
        {currentUser.avatar_url ? (
           <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
        )}
      </div>
      
      <button 
        onClick={onOpenReviewModal}
        className="flex-1 bg-gray-50 hover:bg-gray-100 text-left rounded-full px-5 py-3 text-gray-400 transition-colors text-sm font-medium flex justify-between items-center group"
      >
        <span>Escreva sobre sua leitura...</span>
        <i className="fas fa-feather-alt text-brand-purple opacity-50 group-hover:opacity-100 transition-opacity"></i>
      </button>

      <button onClick={onOpenReviewModal} className="p-3 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors">
         <i className="fas fa-camera text-xl"></i>
      </button>
    </div>
  );
}