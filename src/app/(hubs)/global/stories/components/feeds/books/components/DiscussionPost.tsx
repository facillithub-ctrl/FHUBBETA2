import React from 'react';
import { StoryPost } from '../../../../types';
import { MessageCircle, HelpCircle } from 'lucide-react';

export default function DiscussionPost({ post }: { post: StoryPost }) {
  const { title, content } = post;

  return (
    <div className="mt-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 shadow-md">
       {/* Elementos Decorativos de Fundo */}
       <div className="absolute top-0 right-0 p-4 opacity-10">
          <MessageCircle size={100} />
       </div>
       
       <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 opacity-80">
             <div className="bg-white/20 p-1.5 rounded-full">
                <HelpCircle size={14} className="text-white" />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest">Debate</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold leading-snug mb-4">
             {title || "Tópico de Discussão"}
          </h3>

          <p className="text-white/90 text-sm md:text-base leading-relaxed bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
             {content}
          </p>

          <div className="mt-4 flex items-center justify-center">
             <button className="bg-white text-purple-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                <MessageCircle size={16} />
                Participar da Conversa
             </button>
          </div>
       </div>
    </div>
  );
}