// CAMINHO: src/app/dashboard/applications/global/stories/components/CreatePostWidget.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { UserProfile } from '../types';

export default function CreatePostWidget({ 
  currentUser, 
  onPostCreate 
}: { 
  currentUser: UserProfile, 
  onPostCreate: (text: string) => void 
}) {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onPostCreate(text);
    setText('');
    setIsExpanded(false);
  };

  return (
    <div className={`bg-white rounded-3xl p-4 mb-6 transition-all duration-300 border border-gray-100 ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="flex gap-4 items-start">
        <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
          {currentUser.avatar_url ? (
             <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 w-full">
          <input 
            type="text" 
            placeholder={`Partilhe a sua experiência cultural...`} 
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-2 placeholder-gray-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          
          {isExpanded && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 animate-fade-in">
               <div className="flex gap-3 text-gray-400">
                 <button type="button" className="hover:text-purple-600 transition-colors"><i className="fas fa-image"></i></button>
                 <button type="button" className="hover:text-purple-600 transition-colors"><i className="fas fa-film"></i></button>
                 <button type="button" className="hover:text-purple-600 transition-colors"><i className="fas fa-gamepad"></i></button>
               </div>
               <button 
                 type="submit" 
                 disabled={!text.trim()}
                 className="px-6 py-2 bg-black text-white text-xs font-bold rounded-full hover:opacity-80 transition-all disabled:opacity-50"
               >
                 Publicar
               </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}