// CAMINHO: src/app/dashboard/applications/global/stories/components/StoriesBar.tsx
"use client";

import Image from 'next/image';
import { StoryCircle, UserProfile } from '../types';

export default function StoriesBar({ stories, currentUser }: { stories: StoryCircle[], currentUser: UserProfile }) {
  return (
    <div className="w-full bg-white border-b border-gray-100 pt-4 pb-6 mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-6 min-w-max px-4 mx-auto max-w-4xl justify-start md:justify-center">
        
        {/* Meu Story (Adicionar) */}
        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="relative w-[70px] h-[70px]">
            <div className="w-full h-full rounded-full p-[3px] border-2 border-dashed border-gray-300 group-hover:border-brand-purple transition-colors">
              <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden relative">
                 {currentUser.avatar_url ? (
                    <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover opacity-90" sizes="70px" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50"><i className="fas fa-user text-gray-300 text-xl"></i></div>
                 )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform bg-gradient-to-r from-brand-purple to-brand-dark">
              <i className="fas fa-plus text-[10px]"></i>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 group-hover:text-brand-purple transition-colors">Criar</span>
        </div>

        {/* Stories de Outros */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className={`w-[70px] h-[70px] rounded-full p-[3px] transition-all duration-300 group-hover:scale-105 ${story.hasUnseen ? 'bg-gradient-to-tr from-brand-purple via-[#A855F7] to-brand-green' : 'bg-gray-100'}`}>
              <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden relative">
                {story.user.avatar_url && (
                   <Image src={story.user.avatar_url} alt={story.user.name} fill className="object-cover" sizes="70px" />
                )}
              </div>
            </div>
            <span className={`text-xs font-medium truncate w-16 text-center ${story.hasUnseen ? 'text-dark-text font-bold' : 'text-gray-400'}`}>
              {story.user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}