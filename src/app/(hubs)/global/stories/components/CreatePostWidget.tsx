"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserProfile } from '../types';

type Props = {
  currentUser: UserProfile;
  onPostCreate: (formData: FormData) => Promise<void>; // Atualizado para FormData
  onOpenAdvancedModal: () => void;
};

// --- UTILITÁRIO DE COMPRESSÃO DE IMAGEM ---
const compressImage = async (file: File, quality = 0.7, maxWidth = 1200): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback se falhar
          }
        }, 'image/jpeg', quality);
      };
    };
  });
};

export default function CreatePostWidget({ currentUser, onPostCreate, onOpenAdvancedModal }: Props) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Criar preview imediato
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Comprimir em background
      try {
        const compressed = await compressImage(file);
        setSelectedImage(compressed);
      } catch (err) {
        console.error("Erro na compressão, usando original", err);
        setSelectedImage(file);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !selectedImage) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', text);
      formData.append('category', 'general'); // Post normal vai pro feed geral
      formData.append('type', 'status');
      
      if (selectedImage) {
        formData.append('file', selectedImage);
      }

      await onPostCreate(formData);
      
      // Reset
      setText('');
      removeImage();
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

        {/* Área de Input */}
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

          {/* Preview da Imagem */}
          {previewUrl && (
            <div className="relative mt-2 mb-2 w-full max-w-sm rounded-xl overflow-hidden group">
               <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover border border-gray-200" />
               <button 
                 onClick={removeImage}
                 className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors"
               >
                 <i className="fas fa-times text-sm w-5 h-5 flex items-center justify-center"></i>
               </button>
            </div>
          )}

          {/* Barra de Ações */}
          <div className="flex justify-between items-center mt-3 mb-2 flex-wrap gap-2">
             
             <div className="flex items-center gap-1 text-brand-purple">
                {/* Input de Arquivo Oculto */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect}
                />

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-purple-50 transition-colors text-brand-purple/80 hover:text-brand-purple relative group" 
                  title="Imagem"
                >
                   <i className="far fa-image text-lg"></i>
                </button>
                
                <button className="p-2 rounded-full hover:bg-purple-50 transition-colors text-brand-purple/80 hover:text-brand-purple" title="GIF">
                   <i className="fas fa-film text-lg"></i>
                </button>
                
                {/* BOTÃO CRIAR REVIEW (Requisitado) */}
                <button 
                  onClick={onOpenAdvancedModal}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition-colors border border-purple-100"
                >
                   <i className="fas fa-plus"></i>
                   <span className="hidden sm:inline">Criar Review</span>
                   <span className="sm:hidden">Review</span>
                </button>
             </div>

             <button 
               onClick={handleSubmit}
               disabled={(!text.trim() && !selectedImage) || isSubmitting}
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