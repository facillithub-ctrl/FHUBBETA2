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

    // Atualiza estado local quando campos mudam
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: { ...(prev.social_links || {}), [network]: value }
        }));
    };

    // Salvar no Banco
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name || formData.fullName, // Compatibilidade com snake_case
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
                addToast({ title: 'Erro', message: error.message, type: 'error' });
            } else {
                addToast({ title: 'Perfil Atualizado', message: 'Suas informações foram salvas.', type: 'success' });
                router.refresh();
            }
        });
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
            
            {/* 1. SEÇÃO VISUAL (Capa + Avatar) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Identidade Visual</h3>
                
                {/* Capa */}
                <CoverUploader 
                    userId={profile.id} 
                    currentUrl={formData.cover_image_url || null}
                    onUploadSuccess={(url) => setFormData(p => ({...p, cover_image_url: url}))}
                />

                {/* Avatar (Sobreposto levemente ou logo abaixo) */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="shrink-0 -mt-12 ml-4 relative z-10">
                        <AvatarUploader 
                            profile={formData} 
                            onUploadSuccess={(url) => setFormData(p => ({...p, avatarUrl: url}))} 
                        />
                    </div>
                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            Recomendado: 400x400px (Avatar) e 1200x400px (Capa).
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* 2. DADOS PESSOAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                    <input 
                        name="full_name"
                        value={formData.full_name || formData.fullName || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apelido (Único)</label>
                    <div className="flex">
                        <span className="p-3 bg-gray-100 dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg text-gray-500">@</span>
                        <input 
                            name="nickname"
                            value={formData.nickname || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg focus:ring-2 focus:ring-brand-purple outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio (Sobre você)</label>
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

            {/* 3. EDUCACIONAL & SOCIAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Escola / Instituição</label>
                    <input 
                        name="schoolName" // Importante manter o nome que o DB espera ou mapear no submit
                        value={formData.schoolName || formData.school_name || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foco (Exame)</label>
                    <select 
                        name="target_exam"
                        value={formData.target_exam || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram (sem @)</label>
                    <input 
                        value={formData.social_links?.instagram || ''}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="usuario"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn (URL)</label>
                    <input 
                        value={formData.social_links?.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>
            </div>

            {/* BOTÃO SALVAR */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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