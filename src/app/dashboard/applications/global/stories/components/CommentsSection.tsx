"use client";

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { addComment, getPostComments } from '../actions';
import { CommentData } from '../types';
// Se tiver biblioteca de toast, descomente:
// import { toast } from 'react-hot-toast';

// Sub-componente recursivo
const CommentItem = ({ comment, postId, onReplySuccess }: { comment: CommentData, postId: string, onReplySuccess: () => void }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggleLike = () => {
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    setLiked(!liked);
    // Aqui você pode adicionar uma action 'toggleCommentLike' futuramente
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    startTransition(async () => {
      try {
        await addComment(postId, replyText, comment.id);
        setReplyText("");
        setIsReplying(false);
        setShowReplies(true);
        onReplySuccess(); // Recarrega a lista
      } catch (error) {
        console.error(error);
      }
    });
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="flex gap-3 mt-4 animate-fade-in">
      {/* Avatar */}
      <div className="relative rounded-full bg-gray-200 flex-shrink-0 overflow-hidden w-8 h-8">
        <Image src={comment.user.avatar || '/assets/images/accont.svg'} alt={comment.user.name} fill className="object-cover" />
      </div>

      <div className="flex-1">
        {/* Balão */}
        <div className="bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 inline-block min-w-[200px]">
          <div className="flex justify-between items-baseline gap-4 mb-0.5">
            <span className="font-bold text-xs text-gray-900 hover:underline cursor-pointer">{comment.user.name}</span>
            <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 leading-snug">{comment.text}</p>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
          <button 
            onClick={toggleLike}
            className={`hover:text-brand-purple transition-colors ${liked ? 'text-brand-purple font-bold' : ''}`}
          >
            Gostar {likesCount > 0 && `(${likesCount})`}
          </button>
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="hover:text-brand-purple transition-colors"
          >
            Responder
          </button>
        </div>

        {/* Input de Resposta */}
        {isReplying && (
           <div className="mt-2 flex gap-2">
             <div className="w-1 h-8 border-l-2 border-gray-200 ml-3 rounded-bl-lg"></div>
             <input 
               autoFocus
               type="text" 
               disabled={isPending}
               value={replyText}
               onChange={(e) => setReplyText(e.target.value)}
               className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs w-full focus:outline-none focus:border-brand-purple" 
               placeholder={`Responder a ${comment.user.name}...`}
               onKeyDown={(e) => {
                 if(e.key === 'Enter') handleSendReply();
               }}
             />
           </div>
        )}

        {/* Botão Ver Respostas */}
        {hasReplies && !showReplies && (
          <button 
            onClick={() => setShowReplies(true)}
            className="flex items-center gap-2 mt-2 ml-2 text-xs font-bold text-gray-500 hover:text-brand-purple"
          >
            <div className="w-6 border-t border-gray-300"></div>
            Ver {comment.replies?.length} respostas
          </button>
        )}

        {/* Renderização Recursiva */}
        {hasReplies && showReplies && (
          <div className="ml-2 border-l-2 border-gray-100 pl-4">
            {comment.replies?.map(reply => (
              <CommentItem key={reply.id} comment={reply} postId={postId} onReplySuccess={onReplySuccess} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CommentsSection({ postId, initialComments = [] }: { postId: string, initialComments?: CommentData[] }) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Função para recarregar comentários atualizados
  const refreshComments = async () => {
    const updated = await getPostComments(postId);
    setComments(updated);
  };

  // Carrega comentários ao montar se não vierem nas props
  useEffect(() => {
    if (initialComments.length === 0) {
      refreshComments();
    }
  }, [postId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    startTransition(async () => {
      try {
        await addComment(postId, text);
        setText("");
        await refreshComments(); // Atualiza a lista
      } catch (e) {
        console.error("Erro ao enviar:", e);
      }
    });
  };

  return (
    <div className="pt-2 bg-white rounded-xl">
      <h3 className="text-sm font-bold text-gray-800 mb-4 px-1">Comentários ({comments.length})</h3>

      {/* Input Principal */}
      <div className="flex gap-3 items-center mb-6">
         <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple text-xs font-bold border border-brand-purple/20">
            EU
         </div>
         <div className="flex-1 relative">
            <input 
              type="text" 
              value={text}
              disabled={isPending}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Adicione um comentário..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
            />
            <button 
                onClick={handleSend}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple hover:scale-110 transition-transform disabled:opacity-50"
            >
               <i className="fas fa-paper-plane"></i>
            </button>
         </div>
      </div>

      {/* Lista */}
      <div className="space-y-2 pb-6">
        {comments.map(c => (
            <CommentItem key={c.id} comment={c} postId={postId} onReplySuccess={refreshComments} />
        ))}
      </div>
    </div>
  );
}