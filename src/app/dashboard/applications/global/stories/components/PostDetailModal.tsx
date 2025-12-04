"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { StoryPost, UserProfile, Comment } from '../types';
import PostCard from './PostCard';
import { VerificationBadge } from '@/components/VerificationBadge'; // Importe o componente

interface PostDetailModalProps {
  post: StoryPost;
  currentUser: UserProfile | null;
  onClose: () => void;
}

export default function PostDetailModal({ post, currentUser, onClose }: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Carregar Comentários
  useEffect(() => {
    const fetchComments = async () => {
      const supabase = createClient();
      // CORREÇÃO: Busca verification_badge na query
      const { data } = await supabase
        .from('stories_comments')
        .select(`
          id,
          content,
          created_at,
          user:profiles (
            id, 
            full_name, 
            avatar_url, 
            nickname, 
            verification_badge, 
            badge
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true }); // Mais antigos primeiro para leitura cronológica

      if (data) {
        const formattedComments: Comment[] = data.map((c: any) => ({
           id: c.id,
           text: c.content,
           createdAt: new Date(c.created_at).toLocaleDateString('pt-BR', { 
             day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
           }),
           user: {
             id: c.user?.id || 'unknown',
             name: c.user?.full_name || 'Usuário',
             avatar_url: c.user?.avatar_url,
             username: c.user?.nickname || '',
             // Mapeamento do selo para o comentário
             verification_badge: c.user?.verification_badge || c.user?.badge || null
           }
        }));
        setComments(formattedComments);
      }
    };
    fetchComments();
  }, [post.id]);

  // Scroll para o último comentário ao abrir ou adicionar
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setIsSending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('stories_comments').insert({
         post_id: post.id,
         user_id: currentUser.id,
         content: newComment
      }).select().single();

      if (!error && data) {
         // Atualização Otimista
         const optimisticComment: Comment = {
            id: data.id,
            text: newComment,
            createdAt: 'Agora',
            user: currentUser
         };
         setComments(prev => [...prev, optimisticComment]);
         setNewComment('');
      }
    } catch (e) {
      console.error("Erro ao comentar:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-6xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Botão Fechar Mobile */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 md:hidden bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* --- ESQUERDA: O POST --- */}
        <div className="md:w-[60%] bg-[#F8F9FA] overflow-y-auto p-4 md:p-10 flex flex-col items-center border-r border-gray-100 scrollbar-thin scrollbar-thumb-gray-200">
           <div className="w-full max-w-xl">
              {/* Reutiliza o PostCard para consistência visual */}
              <PostCard post={post} />
           </div>
        </div>

        {/* --- DIREITA: COMENTÁRIOS --- */}
        <div className="md:w-[40%] flex flex-col bg-white h-full relative">
           
           {/* Header dos Comentários */}
           <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white z-10 sticky top-0">
              <div>
                 <h3 className="font-bold text-lg text-gray-900">Comentários</h3>
                 <span className="text-xs text-gray-400 font-medium">Conversa sobre este post</span>
              </div>
              <button 
                onClick={onClose} 
                className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                 <i className="fas fa-times"></i>
              </button>
           </div>

           {/* Lista de Comentários */}
           <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-100">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 opacity-60">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl">
                      <i className="far fa-comments"></i>
                   </div>
                   <p className="text-sm font-medium">Seja o primeiro a comentar!</p>
                </div>
              ) : (
                comments.map((comment) => (
                   <div key={comment.id} className="flex gap-3 group animate-slide-in">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-sm overflow-hidden relative flex-shrink-0 mt-1">
                         {comment.user.avatar_url ? (
                           <Image src={comment.user.avatar_url} alt="User" fill className="object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fas fa-user text-xs"></i></div>
                         )}
                      </div>
                      <div className="flex-1">
                         <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-50/50">
                            <div className="flex justify-between items-baseline mb-1">
                               <div className="flex items-center gap-1">
                                   <span className="text-xs font-bold text-gray-900 hover:text-brand-purple cursor-pointer transition-colors">
                                     {comment.user.name}
                                   </span>
                                   {/* ADIÇÃO: Selo no comentário */}
                                   <VerificationBadge badge={comment.user.verification_badge} size="4px" />
                               </div>
                               <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                         </div>
                         <div className="flex gap-4 mt-1 ml-2">
                            <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600">Curtir</button>
                            <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600">Responder</button>
                         </div>
                      </div>
                   </div>
                ))
              )}
              <div ref={commentsEndRef} />
           </div>

           {/* Input Fixo no Rodapé */}
           <div className="p-4 border-t border-gray-50 bg-white">
              <div className="flex gap-2 items-end bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:border-brand-purple/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-purple/5 transition-all shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0 mb-1 ml-1 border border-white">
                    {currentUser?.avatar_url && <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />}
                 </div>
                 <textarea 
                   value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendComment())}
                   placeholder="Escreva um comentário..."
                   className="flex-1 bg-transparent text-sm outline-none px-2 py-2 max-h-24 resize-none placeholder-gray-400 scrollbar-hide"
                   rows={1}
                 />
                 <button 
                   disabled={!newComment.trim() || isSending}
                   onClick={handleSendComment}
                   className="w-9 h-9 rounded-lg bg-brand-purple text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 hover:bg-[#320261] hover:scale-105 transition-all mb-0.5 shadow-md shadow-brand-purple/20"
                 >
                   {isSending ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-paper-plane text-xs"></i>}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}