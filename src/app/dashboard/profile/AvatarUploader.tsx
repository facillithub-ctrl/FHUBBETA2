"use client";

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';

type AvatarUploaderProps = {
  profile: UserProfile;
  onUploadSuccess: (newUrl: string) => void;
  disabled?: boolean; // 1. Adicionamos a prop 'disabled'
};

export default function AvatarUploader({ profile, onUploadSuccess, disabled = false }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAvatarClick = () => {
    // 2. Não faz nada se estiver desativado
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${profile.id}/${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newAvatarUrl = data.publicUrl;

    // 3. O componente agora apenas retorna o URL
    // A lógica de salvar será tratada pelo componente pai ('ProfileInfo')
    onUploadSuccess(newAvatarUrl);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative w-32 h-32 rounded-full mb-4 ${disabled ? 'cursor-default' : 'cursor-pointer group'}`}
        onClick={handleAvatarClick}
      >
        {profile.avatarUrl ? (
          <Image
            key={profile.avatarUrl} 
            src={profile.avatarUrl}
            alt="Avatar do usuário"
            fill
            sizes="128px"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center font-bold text-4xl text-brand-purple dark:bg-gray-700">
            {profile.fullName?.charAt(0) || 'F'}
          </div>
        )}
        
        {/* 4. O 'overlay' de upload só aparece se NÃO estiver desativado */}
        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'} text-white text-2xl`}></i>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading || disabled}
        accept="image/png, image/jpeg"
        className="hidden"
      />
      {/* 5. O texto "Enviando..." só aparece durante o upload */}
      {uploading && <p className="text-sm text-text-secondary">A enviar...</p>}
    </div>
  );
}