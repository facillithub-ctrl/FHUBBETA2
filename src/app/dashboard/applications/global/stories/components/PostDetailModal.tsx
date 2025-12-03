"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { StoryPost, UserProfile } from '../types';
import BookgramCard from './BookgramCard';

interface PostDetailModalProps {
  post: StoryPost;
  currentUser: UserProfile | null;
  onClose: () => void;
}

export default function PostDetailModal({ post, currentUser, onClose }: PostDetailModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Carregar Comentários do Firebase (Realtime)
  useEffect(() => {
    const q = query(
      collection(db, 'posts', post.id, 'comments'), 
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        text: newComment,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar_url,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (e) {
      console.error("Erro ao comentar", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-5xl h-[85vh] rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Lado Esquerdo: O Post */}
        <div className="md:w-[60%] bg-gray-50 overflow-y-auto p-4 md:p-8 flex items-center justify-center border-r border-gray-100">
           <div className="w-full max-w-md pointer-events-none"> 
              {/* pointer-events-none para não clicar no card dentro do modal e abrir modal de novo */}
              <BookgramCard post={post} currentUserId={currentUser?.id} />
           </div>
        </div>

        {/* Lado Direito: Comentários */}
        <div className="md:w-[40%] flex flex-col bg-white h-full">
           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Comentários ({comments.length})</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><i className="fas fa-times"></i></button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 && (
                <div className="text-center text-gray-400 mt-10">Seja o primeiro a comentar!</div>
              )}
              {comments.map((comment) => (
                 <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0">
                       {comment.userAvatar && <Image src={comment.userAvatar} alt="User" fill className="object-cover" />}
                    </div>
                    <div>
                       <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-tl-none">
                          <p className="text-xs font-bold text-slate-800 mb-0.5">{comment.userName}</p>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                       </div>
                       <span className="text-[10px] text-gray-400 ml-2">Há instantes</span>
                    </div>
                 </div>
              ))}
           </div>

           {/* Input */}
           <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-purple-300 transition-colors">
                 <input 
                   value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                   placeholder="Adicione um comentário..."
                   className="flex-1 bg-transparent text-sm outline-none px-2"
                 />
                 <button 
                   disabled={!newComment.trim() || isSending}
                   onClick={handleSendComment}
                   className="text-purple-600 font-bold text-sm px-3 disabled:opacity-50"
                 >
                   Publicar
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}