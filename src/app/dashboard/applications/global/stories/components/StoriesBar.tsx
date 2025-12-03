"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { StoryCircle, UserProfile } from '../types';
import { db } from '@/lib/firebase';
import createClient from '@/utils/supabase/client';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy } from 'firebase/firestore';

interface StoriesBarProps {
  currentUser?: UserProfile | null;
  // stories prop pode ser removida ou usada como fallback
  stories?: StoryCircle[]; 
}

export default function StoriesBar({ currentUser }: StoriesBarProps) {
  const [stories, setStories] = useState<StoryCircle[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Carregar Stories Vivos (Últimas 24h)
  useEffect(() => {
    const fetchStories = async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      // Busca usuários que postaram stories recentes no Firestore
      // Nota: Em produção, isso seria uma query mais otimizada ou agrupada
      const q = query(
        collection(db, 'ephemeral_stories'),
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const storiesMap = new Map<string, StoryCircle>();

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!storiesMap.has(data.userId)) {
          storiesMap.set(data.userId, {
            id: data.userId, // Agrupa por usuário
            user: {
                id: data.userId,
                name: data.userName,
                avatar_url: data.userAvatar,
                username: ''
            },
            hasUnseen: true, // Lógica de visto pode ser aprimorada depois
            category: 'all'
          });
        }
      });

      setStories(Array.from(storiesMap.values()));
    };

    fetchStories();
  }, []);

  // 2. Upload de Novo Story
  const handleUploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;
    setIsUploading(true);
    
    try {
        const file = e.target.files[0];
        const supabase = createClient();
        
        // Upload imagem Supabase
        const fileName = `story-${currentUser.id}-${Date.now()}`;
        await supabase.storage.from('stories').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(fileName);

        // Salvar metadados no Firestore (Expira em 24h logicamente)
        await addDoc(collection(db, 'ephemeral_stories'), {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar_url,
            mediaUrl: publicUrl,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
        });

        // Feedback visual rápido (adiciona o próprio user na lista)
        setStories(prev => [
            { id: currentUser.id, user: currentUser, hasUnseen: false, isLive: true },
            ...prev.filter(s => s.id !== currentUser.id)
        ]);

    } catch (error) {
        console.error('Erro ao postar story:', error);
    } finally {
        setIsUploading(false);
    }
  };

  if (!currentUser) return <div className="h-24 animate-pulse bg-gray-50 rounded-xl mb-4"></div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUploadStory} 
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* SEU STORY */}
      <div 
        className="flex flex-col items-center gap-2 cursor-pointer relative group min-w-[72px]"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`relative w-[72px] h-[72px] transition-transform ${isUploading ? 'opacity-50 scale-95' : ''}`}>
          <div className="w-full h-full rounded-full p-[2px] border-2 border-dashed border-purple-300 group-hover:border-purple-500">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
               {currentUser.avatar_url ? (
                 <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />
               ) : (
                 <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">{currentUser.name.charAt(0)}</div>
               )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] shadow-sm">
            {isUploading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-plus"></i>}
          </div>
        </div>
        <span className="text-xs font-medium text-gray-500">Seu story</span>
      </div>

      {/* LISTA DE STORIES */}
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]">
          <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-gray-200'}`}>
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-white">
               {story.user.avatar_url ? (
                  <Image src={story.user.avatar_url} alt={story.user.name} fill className="object-cover" />
               ) : (
                  <div className="w-full h-full bg-gray-100"></div>
               )}
            </div>
          </div>
          <span className="text-xs font-medium text-gray-600 truncate max-w-[74px]">
            {story.user.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
}