"use client";

import { useState, ChangeEvent } from 'react';
import type { StepProps } from '../OnboardingFlow';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';

// --- Início do Componente Local de Upload ---
/**
 * Este é um uploader de avatar simplificado SÓ para o Onboarding.
 * Ele não salva o URL no 'profiles' (isso acontece na etapa final),
 * ele apenas faz o upload para o Storage e retorna o URL para o estado.
 */
const OnboardingAvatarUploader = ({ userId, avatarUrl, onUploadSuccess }: { 
  userId: string, 
  avatarUrl: string | null, 
  onUploadSuccess: (url: string) => void 
}) => {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Gera um caminho único para o avatar
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        
        // Faz o upload para o bucket 'avatars'
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            alert(`Erro no upload: ${uploadError.message}`);
            setUploading(false);
            return;
        }

        // Obtém o URL público do ficheiro que acabámos de enviar
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        // Chama a função 'pai' (no Step1_Profile) com o novo URL
        onUploadSuccess(data.publicUrl);
        setUploading(false);
    };

    return (
        <div className="flex flex-col items-center">
            <label htmlFor="avatar-upload" className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        sizes="128px"
                        className="rounded-full object-cover"
                    />
                ) : (
                    // Placeholder se não houver imagem
                    <div className="w-full h-full rounded-full bg-bg-secondary dark:bg-bg-primary flex items-center justify-center">
                        <i className="fas fa-user text-5xl text-text-secondary"></i>
                    </div>
                )}
                {/* Efeito hover para o upload */}
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'} text-white text-2xl`}></i>
                </div>
            </label>
            <input
                type="file"
                id="avatar-upload"
                onChange={handleFileChange}
                disabled={uploading}
                accept="image/png, image/jpeg"
                className="hidden"
            />
            <label htmlFor="avatar-upload" className="font-medium text-brand-purple text-sm hover:underline cursor-pointer">
                {uploading ? 'A enviar...' : 'Escolher foto'}
            </label>
        </div>
    );
};
// --- Fim do Componente Local de Upload ---


/**
 * ETAPA 3 do Plano (Step 1 do Código): Perfil Básico Inteligente
 * Recolhe: Nome, Data Nasc., País, Idiomas, Foto (opcional).
 */
export default function Step1_Profile({ userProfile, onboardingData, setOnboardingData, onNext }: StepProps) {
    
    // Estado local para os campos do formulário
    const [fullName, setFullName] = useState(onboardingData.full_name);
    const [birthDate, setBirthDate] = useState(onboardingData.birth_date);
    const [country, setCountry] = useState(onboardingData.country);
    const [language, setLanguage] = useState(onboardingData.language);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName) {
            alert("O nome completo é obrigatório."); // (Usaremos o ToastContext aqui no futuro)
            return;
        }
        
        // 1. Atualiza o estado central no 'OnboardingFlow'
        setOnboardingData(prev => ({
            ...prev,
            full_name: fullName,
            birth_date: birthDate,
            country: country,
            language: language,
            avatar_url: avatarUrl || undefined // Salva a URL do avatar
        }));
        
        // 2. Avança para a próxima etapa
        onNext();
    };

    return (
        <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
            <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Bem-vindo(a) ao Facillit Hub!</h1>
            <p className="text-text-secondary mb-8 text-center">Vamos começar por configurar o seu perfil básico. (Etapa 3 de 8)</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <OnboardingAvatarUploader 
                    userId={userProfile.id}
                    avatarUrl={avatarUrl}
                    onUploadSuccess={(url) => setAvatarUrl(url)}
                />

                {/* Nome Completo */}
                <div className="relative">
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                    <i className="fas fa-user absolute left-3 top-10 text-text-secondary opacity-50"></i>
                    <input 
                        type="text" 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                        placeholder="O seu nome completo"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
                    />
                </div>
                
                {/* Data de Nascimento */}
                <div className="relative">
                    <label htmlFor="birthDate" className="block text-sm font-medium text-text-secondary mb-1">Data de Nascimento</label>
                    <i className="fas fa-calendar-alt absolute left-3 top-10 text-text-secondary opacity-50"></i>
                    <input 
                        type="date" 
                        id="birthDate"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* País */}
                    <div className="relative">
                        <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">País</label>
                        <i className="fas fa-globe absolute left-3 top-10 text-text-secondary opacity-50"></i>
                        <select 
                            id="country" 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm appearance-none dark:bg-bg-primary dark:border-gray-700"
                        >
                            <option>Brasil</option>
                            <option>Portugal</option>
                            <option>Angola</option>
                            <option>Moçambique</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    
                    {/* Idioma */}
                    <div className="relative">
                        <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-1">Idioma</label>
                        <i className="fas fa-language absolute left-3 top-10 text-text-secondary opacity-50"></i>
                        <select 
                            id="language" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm appearance-none dark:bg-bg-primary dark:border-gray-700"
                        >
                            <option>Português (Brasil)</option>
                            <option>Português (Portugal)</option>
                            <option>English</option>
                        </select>
                    </div>
                </div>

                {/* Botão de Navegação */}
                <div className="flex justify-end items-center pt-4">
                    <button
                        type="submit"
                        className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
                    >
                        Continuar
                    </button>
                </div>
            </form>
        </div>
    );
}