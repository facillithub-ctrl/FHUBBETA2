// CAMINHO: src/app/dashboard/applications/global/stories/components/StoriesBar.tsx
"use client";

import Image from 'next/image';
import { StoryCircle, UserProfile } from '../types';

export default function StoriesBar({ stories, currentUser }: { stories: StoryCircle[], currentUser: UserProfile }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2">
      <div className="flex gap-4">
        
        {/* Meu Story */}
        <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
          <div className="relative w-[68px] h-[68px]">
            <div className="w-full h-full rounded-full p-[2px] border-2 border-dashed border-gray-300 group-hover:border-brand-purple transition-colors">
              <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden relative">
                 {currentUser.avatar_url ? (
                    <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover opacity-90" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50"><i className="fas fa-user text-gray-300 text-xl"></i></div>
                 )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <i className="fas fa-plus text-[10px]"></i>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-500 group-hover:text-brand-purple">Novo</span>
        </div>

        {/* Outros Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
            <div className={`w-[68px] h-[68px] rounded-full p-[3px] transition-all duration-300 group-hover:scale-105 ${story.hasUnseen ? 'bg-gradient-to-tr from-brand-purple via-pink-500 to-orange-400' : 'bg-gray-200'}`}>
              <div className="w-full h-full rounded-full border-[3px] border-white bg-white overflow-hidden relative">
                {story.user.avatar_url && (
                   <Image src={story.user.avatar_url} alt={story.user.name} fill className="object-cover" />
                )}
              </div>
            </div>
            <span className="text-[10px] font-medium truncate w-16 text-center text-gray-600">
              {story.user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}