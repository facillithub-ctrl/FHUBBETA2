"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserProfile, StoryCategory } from '../types';
import createClient from '@/utils/supabase/client';

interface CreatePostWidgetProps {
  currentUser: UserProfile;
  onPostCreate: (text: string) => void; // Callback para atualizar a UI localmente (opcional)
}

export default function CreatePostWidget({ currentUser, onPostCreate }: CreatePostWidgetProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorias disponíveis
  const categories: StoryCategory[] = ['books', 'movies', 'series', 'anime', 'games', 'sports'];
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('books');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;
    setIsUploading(true);

    try {
      const supabase = createClient();
      let publicMediaUrl = null;

      // 1. Upload da Imagem (se houver)
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('posts') // Certifique-se que este bucket existe no Supabase
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
          
        publicMediaUrl = publicUrl;
      }

      // 2. Chama a Server Action (via API ou direta se configurada) ou insere direto
      // Aqui vamos inserir direto pelo cliente para agilidade, mas idealmente usa-se Server Action
      const { error: dbError } = await supabase
        .from('stories_posts')
        .insert({
          user_id: currentUser.id,
          content: content,
          category: selectedCategory,
          media_url: publicMediaUrl,
          type: publicMediaUrl ? 'review' : 'status', // Define tipo baseado na mídia
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      // Limpar formulário
      setContent('');
      setMediaFile(null);
      setPreviewUrl(null);
      onPostCreate(content); // Atualiza feed pai
      
    } catch (error) {
      console.error('Erro ao postar:', error);
      alert('Erro ao publicar. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
          {currentUser.avatar_url ? (
            <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-purple text-white flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`O que você está lendo/assistindo, ${currentUser.name.split(' ')[0]}?`}
            className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none min-h-[80px]"
          />
          
          {previewUrl && (
            <div className="relative mt-3 rounded-xl overflow-hidden h-48 w-full bg-gray-100">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <button 
                    onClick={() => { setMediaFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,video/*" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-brand-purple hover:bg-purple-50 p-2 rounded-lg transition-colors"
              >
                <i className="far fa-image text-lg"></i>
              </button>
              
              {/* Seletor de Categoria Rápido */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as StoryCategory)}
                className="text-xs bg-gray-100 text-gray-600 rounded-lg px-2 py-1 border-none focus:ring-0 cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isUploading || (!content && !mediaFile)}
              className="bg-brand-purple text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? 'Enviando...' : (
                <>Enviar <i className="fas fa-paper-plane"></i></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}