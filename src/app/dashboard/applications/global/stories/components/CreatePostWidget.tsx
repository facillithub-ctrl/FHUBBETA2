"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserProfile, StoryPost } from '../types';

type Props = {
  currentUser: UserProfile;
  onPostCreate: (post: Partial<StoryPost>) => Promise<void>;
  onOpenAdvancedModal: () => void;
};

export default function CreatePostWidget({ currentUser, onPostCreate, onOpenAdvancedModal }: Props) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await onPostCreate({
        content: text,
        category: 'all',
        type: 'status'
      });
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      setIsFocused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`pt-4 pb-2 px-4 transition-colors ${isFocused ? 'bg-gray-50/30' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden border border-gray-200">
            {currentUser.avatar_url ? (
               <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-user"></i></div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            placeholder="O que você está pensando?"
            className="w-full bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400 resize-none overflow-hidden min-h-[42px] leading-relaxed"
            rows={1}
            value={text}
            onChange={handleInput}
            onFocus={() => setIsFocused(true)}
            disabled={isSubmitting}
          />

          {/* Barra de Ações */}
          <div className="flex justify-between items-center mt-3 mb-2 flex-wrap gap-2">
             
             <div className="flex items-center gap-1 text-brand-purple">
                <button className="p-2 rounded-full hover:bg-purple-50 transition-colors text-brand-purple/80 hover:text-brand-purple" title="Mídia">
                   <i className="far fa-image text-lg"></i>
                </button>
                <button className="p-2 rounded-full hover:bg-purple-50 transition-colors text-brand-purple/80 hover:text-brand-purple" title="GIF">
                   <i className="fas fa-film text-lg"></i>
                </button>
                <button className="p-2 rounded-full hover:bg-purple-50 transition-colors text-brand-purple/80 hover:text-brand-purple" title="Enquete">
                   <i className="fas fa-poll-h text-lg"></i>
                </button>
                
                {/* 2. BOTÃO DE POST ESPECÍFICO (REVIEW/LISTA) AQUI */}
                <button 
                  onClick={onOpenAdvancedModal}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition-colors border border-purple-100"
                >
                   <i className="fas fa-plus"></i>
                   <span className="hidden sm:inline">Criar Review</span>
                   <span className="sm:hidden">Review</span>
                </button>
             </div>

             {/* Botão Publicar com bg-brand-gradient */}
             <button 
               onClick={handleSubmit}
               disabled={!text.trim() || isSubmitting}
               className="bg-brand-gradient text-white font-bold px-5 py-1.5 rounded-full text-sm hover:opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
             >
               {isSubmitting ? 'Enviando...' : 'Publicar'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}