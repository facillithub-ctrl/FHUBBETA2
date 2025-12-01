"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { UserProfile } from '@/app/dashboard/types';
import { useToast } from '@/contexts/ToastContext';
import AvatarUploader from '@/app/dashboard/profile/AvatarUploader';
import CoverUploader from './CoverUploader';

export default function AccountEditProfile({ profile }: { profile: UserProfile }) {
    const [formData, setFormData] = useState(profile);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const supabase = createClient();
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Tratamento para Nickname: remove espaços e lowercase
        if (name === 'nickname') {
            const cleanValue = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: { ...(prev.social_links || {}), [network]: value }
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nickname) {
            addToast({ title: 'Erro', message: 'O apelido é obrigatório.', type: 'error' });
            return;
        }

        startTransition(async () => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name || formData.fullName, 
                    nickname: formData.nickname,
                    bio: formData.bio,
                    school_name: formData.schoolName || formData.school_name,
                    target_exam: formData.target_exam,
                    cover_image_url: formData.cover_image_url,
                    avatar_url: formData.avatarUrl || formData.avatar_url,
                    social_links: formData.social_links
                })
                .eq('id', profile.id);

            if (error) {
                if (error.code === '23505') { 
                    addToast({ title: 'Apelido em uso', message: 'Este apelido já existe. Escolha outro.', type: 'error' });
                } else {
                    addToast({ title: 'Erro', message: error.message, type: 'error' });
                }
            } else {
                addToast({ title: 'Perfil Atualizado', message: 'Suas informações foram salvas com sucesso.', type: 'success' });
                router.refresh();
            }
        });
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
            
            {/* 1. ÁREA VISUAL */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Identidade Visual</h3>
                    <a 
                        href={`/u/${profile.nickname}`} 
                        target="_blank" 
                        className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                    >
                        Ver Perfil Público <i className="fas fa-external-link-alt"></i>
                    </a>
                </div>
                
                {/* Cover Uploader */}
                <CoverUploader 
                    userId={profile.id} 
                    currentUrl={formData.cover_image_url || null}
                    onUploadSuccess={(url) => setFormData(p => ({...p, cover_image_url: url}))}
                />

                {/* Avatar Uploader (Sobreposto) */}
                <div className="flex items-center gap-6 mt-4 px-4">
                    <div className="shrink-0 -mt-16 relative z-10">
                        <AvatarUploader 
                            profile={formData} 
                            onUploadSuccess={(url) => setFormData(p => ({...p, avatarUrl: url, avatar_url: url}))} 
                        />
                    </div>
                    <div className="pt-2 hidden md:block">
                        <p className="text-sm text-gray-500">
                            Personalize sua capa e avatar.
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* 2. DADOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                    <input 
                        name="full_name"
                        value={formData.full_name || formData.fullName || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none transition-all"
                        placeholder="Seu nome"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apelido (Único)</label>
                    <div className="flex group focus-within:ring-2 focus-within:ring-brand-purple rounded-lg transition-all">
                        <span className="p-3 bg-gray-100 dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg text-gray-500 font-medium">@</span>
                        <input 
                            name="nickname"
                            value={formData.nickname || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg outline-none"
                            placeholder="usuario"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                    <textarea 
                        name="bio"
                        rows={3}
                        value={formData.bio || ''}
                        onChange={handleChange}
                        maxLength={160}
                        placeholder="Conte um pouco sobre seus objetivos..."
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none transition-all resize-none"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{formData.bio?.length || 0}/160</div>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* 3. DADOS EDUCACIONAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instituição</label>
                    <input 
                        name="schoolName" // Mapeia para o estado local, depois converte para school_name no save
                        value={formData.schoolName || formData.school_name || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none"
                        placeholder="Sua escola"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foco Principal</label>
                    <select 
                        name="target_exam"
                        value={formData.target_exam || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="ENEM">ENEM</option>
                        <option value="FUVEST">FUVEST</option>
                        <option value="Concursos">Concursos</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                
                {/* Redes Sociais */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instagram (Usuário)
                    </label>
                    <input 
                        value={formData.social_links?.instagram || ''}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="ex: joaosilva"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        LinkedIn (URL)
                    </label>
                    <input 
                        value={formData.social_links?.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                </div>
            </div>

            {/* BOTÃO SALVAR */}
            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
                >
                    {isPending ? (
                        <><i className="fas fa-spinner fa-spin"></i> Salvando...</>
                    ) : (
                        <><i className="fas fa-save"></i> Salvar Alterações</>
                    )}
                </button>
            </div>
        </form>
    );
}