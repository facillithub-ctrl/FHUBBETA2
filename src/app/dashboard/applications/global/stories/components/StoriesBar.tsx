"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { StoryCircle, UserProfile } from '../types';
import { db } from '@/lib/firebase';
import createClient from '@/utils/supabase/client';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, serverTimestamp } from 'firebase/firestore';

interface StoriesBarProps {
  currentUser?: UserProfile | null;
  stories?: StoryCircle[]; // Mantido para compatibilidade, mas o componente busca os reais
}

export default function StoriesBar({ currentUser }: StoriesBarProps) {
  const [stories, setStories] = useState<StoryCircle[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // TRAVA DE SEGURANÇA (useRef não depende de re-renderização)
  const isUploadingRef = useRef(false);

  // 1. Carregar Stories (Firestore)
  useEffect(() => {
    let isMounted = true;
    const fetchStories = async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      try {
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
              id: data.userId,
              user: {
                  id: data.userId,
                  name: data.userName,
                  avatar_url: data.userAvatar,
                  username: ''
              },
              hasUnseen: true,
              category: 'all'
            });
          }
        });

        if (isMounted) setStories(Array.from(storiesMap.values()));
      } catch (error) {
        console.error("Erro ao carregar stories:", error);
      }
    };

    fetchStories();
    return () => { isMounted = false; };
  }, []);

  // 2. Upload com Trava de Segurança
  const handleUploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se já estiver enviando (ref true), PARA IMEDIATAMENTE
    if (isUploadingRef.current || !currentUser || !e.target.files?.[0]) return;
    
    // Ativa a trava
    isUploadingRef.current = true;
    setIsUploading(true);
    
    try {
        const file = e.target.files[0];
        const supabase = createClient();
        
        // Upload Supabase
        const fileName = `story-${currentUser.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('stories').upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(fileName);

        // Salvar Firestore
        await addDoc(collection(db, 'ephemeral_stories'), {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar_url,
            mediaUrl: publicUrl,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
        });

        // Atualiza UI localmente para feedback imediato
        setStories(prev => {
            // Remove se já existir para adicionar no início
            const filtered = prev.filter(s => s.id !== currentUser.id);
            return [{ 
                id: currentUser.id, 
                user: currentUser, 
                hasUnseen: false, 
                isLive: true 
            }, ...filtered];
        });

    } catch (error) {
        console.error('Erro ao postar story:', error);
        alert('Erro ao enviar story.');
    } finally {
        // Libera a trava
        isUploadingRef.current = false;
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Renderização de Skeleton se user não carregou
  if (!currentUser) return <div className="h-24 bg-gray-50/50 rounded-xl mb-4 animate-pulse"></div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUploadStory} 
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* SEU STORY (Botão de Adicionar) */}
      <div 
        className="flex flex-col items-center gap-2 cursor-pointer relative group min-w-[72px]"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className={`relative w-[72px] h-[72px] transition-transform ${isUploading ? 'opacity-50 scale-95' : ''}`}>
          <div className="w-full h-full rounded-full p-[2px] border-2 border-dashed border-purple-300 group-hover:border-purple-500 transition-colors">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
               {currentUser.avatar_url ? (
                 <Image src={currentUser.avatar_url} alt="Eu" fill className="object-cover" />
               ) : (
                 <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl">
                    {currentUser.name.charAt(0)}
                 </div>
               )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] shadow-sm group-hover:scale-110 transition-transform">
            {isUploading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-plus"></i>}
          </div>
        </div>
        <span className="text-xs font-medium text-gray-500">Seu story</span>
      </div>

      {/* OUTROS STORIES */}
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group">
          <div className={`w-[72px] h-[72px] rounded-full p-[2px] transition-all ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:rotate-6' : 'bg-gray-200'}`}>
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-white">
               {story.user.avatar_url ? (
                  <Image src={story.user.avatar_url} alt={story.user.name} fill className="object-cover" />
               ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <i className="fas fa-user"></i>
                  </div>
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