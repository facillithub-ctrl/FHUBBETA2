"use client";

import { useEffect, useState, useRef } from 'react';
import { getPostComments, addPostComment } from '../actions';
import { Comment } from '../types';
import { Send, Loader2, User } from 'lucide-react';
import Image from 'next/image';

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchComments = async () => {
        try {
            const data = await getPostComments(postId);
            if (isMounted) {
                setComments(data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Erro ao carregar comentários:", error);
            if (isMounted) setLoading(false);
        }
    };

    fetchComments();
    
    // Focar no input suavemente
    setTimeout(() => inputRef.current?.focus(), 100);

    return () => { isMounted = false; };
  }, [postId]);

  const handleSend = async () => {
      if (!newComment.trim() || sending) return;
      
      const tempId = Date.now().toString(); // ID temporário para UI otimista
      const commentText = newComment;
      setNewComment(''); // Limpa input imediatamente
      setSending(true);
      
      try {
          const added = await addPostComment(postId, commentText);
          if (added) {
              setComments(prev => [...prev, added]);
          }
      } catch (err) {
          console.error("Falha ao enviar", err);
          setNewComment(commentText); // Devolve o texto em caso de erro
      } finally {
          setSending(false);
      }
  };

  return (
    <div className="pt-4 pb-2 bg-gray-50/50 rounded-b-xl animate-in slide-in-from-top-2 duration-300">
      
      {/* Lista de Comentários */}
      <div className="space-y-4 mb-5 px-2 max-h-[400px] overflow-y-auto custom-scrollbar">
         {loading ? (
             <div className="py-6 flex justify-center text-gray-400 gap-2 items-center">
                 <Loader2 size={16} className="animate-spin" />
                 <span className="text-xs">Carregando conversa...</span>
             </div>
         ) : comments.length === 0 ? (
             <div className="text-center py-6">
                <p className="text-gray-400 text-xs italic">Nenhum comentário ainda. Seja o primeiro!</p>
             </div>
         ) : (
             comments.map((c) => (
                 <div key={c.id} className="flex gap-3 text-sm group">
                     {/* Avatar */}
                     <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative border border-gray-100">
                         {c.user.avatar_url ? (
                             <Image src={c.user.avatar_url} alt={c.user.name} fill className="object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                <User size={14} />
                             </div>
                         )}
                     </div>
                     
                     {/* Balão */}
                     <div className="flex-1">
                         <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-full">
                             <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                 <span className="font-bold text-[13px] text-gray-900 hover:underline cursor-pointer">
                                    {c.user.name}
                                 </span>
                                 <span className="text-[10px] text-gray-400 font-medium">
                                    {c.createdAt}
                                 </span>
                             </div>
                             <p className="text-gray-800 text-[13px] leading-relaxed whitespace-pre-wrap">{c.text}</p>
                         </div>
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-2 pb-1 sticky bottom-0">
         <div className="relative flex-1">
            <input 
                ref={inputRef}
                type="text" 
                className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/50 transition-all placeholder:text-gray-400 shadow-sm"
                placeholder="Escreva sua resposta..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={sending}
            />
            <button 
                onClick={handleSend}
                disabled={!newComment.trim() || sending}
                className="absolute right-1.5 top-1.5 p-1.5 bg-brand-purple text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:bg-gray-300 transition-all"
            >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
         </div>
      </div>
    </div>
  );
}