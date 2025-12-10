"use client";

import { useEffect, useState, useRef } from 'react';
import { getPostComments, addPostComment } from '../actions';
import { Comment } from '../types';
import { Send, Loader2 } from 'lucide-react';

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPostComments(postId).then(data => {
        setComments(data);
        setLoading(false);
    });
    // Focar no input ao abrir
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [postId]);

  const handleSend = async () => {
      if (!newComment.trim()) return;
      setSending(true);
      
      const added = await addPostComment(postId, newComment);
      if (added) {
          setComments(prev => [...prev, added]); // Update otimista
          setNewComment('');
      }
      setSending(false);
  };

  return (
    <div className="pt-3 pb-2">
      {/* Lista */}
      <div className="space-y-4 mb-4">
         {loading ? (
             <div className="py-4 text-center text-gray-400 text-xs flex justify-center gap-2">
                 <Loader2 size={14} className="animate-spin" /> Carregando conversas...
             </div>
         ) : comments.length === 0 ? (
             <p className="text-gray-400 text-xs py-2 italic text-center">Seja o primeiro a comentar.</p>
         ) : (
             comments.map(c => (
                 <div key={c.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                     <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                         {c.user.avatar_url && <img src={c.user.avatar_url} alt="" className="w-full h-full object-cover" />}
                     </div>
                     <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
                         <div className="flex justify-between items-baseline mb-0.5">
                             <span className="font-bold text-xs text-gray-900">{c.user.name}</span>
                             <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                         </div>
                         <p className="text-gray-800 text-[13px]">{c.text}</p>
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* Input */}
      <div className="relative flex items-center gap-2">
         <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0" />
         <input 
            ref={inputRef}
            type="text" 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all placeholder:text-gray-400"
            placeholder="Escreva sua resposta..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={sending}
         />
         <button 
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            className="p-2 text-brand-purple hover:bg-purple-50 rounded-full disabled:text-gray-300 transition-colors"
         >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
         </button>
      </div>
    </div>
  );
}