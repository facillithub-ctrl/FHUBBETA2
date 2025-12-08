"use client";

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';
import AvatarUploader from './AvatarUploader';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; };
} | null;
type RankInfo = { rank: number | null; state: string | null; } | null;

type ProfileClientProps = {
  profile: UserProfile;
  userEmail: string | undefined;
  statistics: {
    stats: Stats;
    streak: number;
    rankInfo: RankInfo;
  }
};

export default function ProfileClient({ profile: initialProfile, userEmail, statistics }: ProfileClientProps) {
  const [formData, setFormData] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const isInstitutionalAccount = !!initialProfile.organization_id;

  // Sincroniza o formulário se o perfil inicial mudar (ex: revalidação do servidor)
  useEffect(() => {
    setFormData(initialProfile);
  }, [initialProfile]);

  // Detecta alterações para habilitar o botão Salvar
  useEffect(() => {
    const isDifferent = JSON.stringify(formData) !== JSON.stringify(initialProfile);
    setHasChanges(isDifferent);
  }, [formData, initialProfile]);

  // Handler genérico para inputs de texto e select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler específico para o objeto aninhado 'social_links'
  const handleSocialChange = (network: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [network]: value
      }
    }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      // Prepara o objeto para update. Note que campos snake_case do banco
      // devem ser mapeados corretamente se o seu 'formData' usa camelCase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName, // Mapeando fullName -> full_name
          nickname: formData.nickname,
          pronoun: formData.pronoun,
          birth_date: formData.birthDate,
          // Escola só atualiza se não for institucional
          school_name: isInstitutionalAccount ? initialProfile.schoolName : formData.schoolName,
          target_exam: formData.target_exam,
          // Novos campos de Perfil Público
          bio: formData.bio,
          social_links: formData.social_links
        })
        .eq('id', formData.id);

      if (!error) {
        addToast({ title: 'Perfil Atualizado', message: 'Suas informações foram salvas com sucesso!', type: 'success' });
        setIsEditing(false);
        router.refresh(); 
      } else {
        addToast({ title: 'Erro ao Atualizar', message: `Não foi possível salvar: ${error.message}`, type: 'error' });
      }
    });
  };
  
  const handleAvatarUpload = (newUrl: string) => {
    setFormData(p => ({ ...p, avatarUrl: newUrl }));
    router.refresh(); 
  };
  
  const userStats = statistics?.stats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- COLUNA ESQUERDA: Avatar e Resumo --- */}
      <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow text-center">
             <AvatarUploader profile={formData} onUploadSuccess={handleAvatarUpload} />
             <div className="flex items-center justify-center gap-2 mt-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formData.fullName || 'Usuário'}</h2>
                <VerificationBadge badge={formData.verification_badge} size="12px" />
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userEmail}</p>
             
             {/* Exibe o nickname com estilo de @handle */}
             <div className="inline-block px-3 py-1 bg-royal-blue/10 rounded-full">
                <p className="text-xs font-mono text-royal-blue dark:text-royal-blue/80 font-bold">
                    @{formData.nickname || 'sem_apelido'}
                </p>
             </div>
          </div>

          <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">Estatísticas</h3>
              <div className="space-y-4">
                  <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 dark:text-gray-400">Redações Corrigidas</span>
                      <span className="font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{userStats?.totalCorrections ?? 0}</span>
                  </div>
                   <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 dark:text-gray-400">Média Geral</span>
                      <span className="font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {userStats ? userStats.averages.avg_final_grade.toFixed(0) : '-'}
                      </span>
                  </div>
                   <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 dark:text-gray-400">Sequência (Streak)</span>
                      <span className="font-bold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">
                        🔥 {statistics.streak} {statistics.streak === 1 ? 'dia' : 'dias'}
                      </span>
                  </div>
                   <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 dark:text-gray-400">Ranking Estadual</span>
                      <span className="font-bold text-royal-blue bg-royal-blue/10 px-2 py-1 rounded">
                        {statistics.rankInfo?.rank ? `#${statistics.rankInfo.rank}` : '-'}
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {/* --- COLUNA DIREITA: Formulário de Edição --- */}
      <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-lg shadow">
        <form onSubmit={handleUpdate}>
          <div className="space-y-8">
            
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                Dados Pessoais
              </h3>
              
              <div>
                <label htmlFor="fullName" className="text-sm font-bold text-gray-600 dark:text-gray-300">Nome Completo</label>
                <input
                  id="fullName" name="fullName" type="text"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nickname" className="text-sm font-bold text-gray-600 dark:text-gray-300">Apelido (Único)</label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600">@</span>
                    <input
                      id="nickname" name="nickname" type="text"
                      value={formData.nickname || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-r-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="birthDate" className="text-sm font-bold text-gray-600 dark:text-gray-300">Data de Nascimento</label>
                  <input
                    id="birthDate" name="birthDate" type="date"
                    value={formData.birthDate?.split('T')[0] || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pronoun" className="text-sm font-bold text-gray-600 dark:text-gray-300">Pronome</label>
                 <select
                  id="pronoun" name="pronoun"
                  value={formData.pronoun || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border"
                >
                  <option value="">Selecione...</option>
                  <option value="Ele/Dele">Ele/Dele</option>
                  <option value="Ela/Dela">Ela/Dela</option>
                  <option value="Elu/Delu">Elu/Delu</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
            </div>

            {/* SEÇÃO 2: PERFIL PÚBLICO (Bio & Social) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mt-2">
                    Perfil Público & Social
                </h3>
                
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="text-sm font-bold text-gray-600 dark:text-gray-300">Sobre mim (Bio)</label>
                  <textarea
                    id="bio" name="bio"
                    rows={3}
                    placeholder="Conte um pouco sobre seus objetivos, sonhos e estudos..."
                    value={formData.bio || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border resize-none focus:ring-2 focus:ring-royal-blue/50 outline-none"
                    maxLength={160}
                  />
                  <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Esta bio aparecerá no seu perfil público.</span>
                      <span className={`text-xs font-mono ${(formData.bio?.length || 0) > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                        {(formData.bio?.length || 0)}/160
                      </span>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Instagram</label>
                        <div className="flex items-center">
                            <span className="p-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-500 dark:bg-gray-800 dark:border-gray-600">@</span>
                            <input
                                type="text"
                                value={formData.social_links?.instagram || ''}
                                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                disabled={!isEditing}
                                placeholder="usuario"
                                className="w-full p-2 border rounded-r-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">LinkedIn</label>
                         <input
                            type="text"
                            value={formData.social_links?.linkedin || ''}
                            onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                            disabled={!isEditing}
                            placeholder="URL completa do perfil"
                            className="w-full p-2 border rounded-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none"
                        />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Github (Opcional)</label>
                         <input
                            type="text"
                            value={formData.social_links?.github || ''}
                            onChange={(e) => handleSocialChange('github', e.target.value)}
                            disabled={!isEditing}
                            placeholder="usuario"
                            className="w-full p-2 border rounded-md bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-dark-border focus:ring-2 focus:ring-royal-blue/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO 3: DADOS EDUCACIONAIS */}
             <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mt-2">
                Educacional
              </h3>
              
              <div>
                <label htmlFor="schoolName" className="text-sm font-bold text-gray-600 dark:text-gray-300">Escola / Instituição</label>
                <input
                  id="schoolName" name="schoolName" type="text"
                  value={formData.schoolName || ''}
                  onChange={handleChange}
                  // Lógica: Se for conta institucional, bloqueia o campo
                  disabled={!isEditing || isInstitutionalAccount}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border"
                />
                {isInstitutionalAccount && (
                    <p className="text-xs text-royal-blue mt-1 flex items-center gap-1">
                        <i className="fas fa-university"></i>
                        Vinculado a uma conta institucional. O nome não pode ser alterado.
                    </p>
                )}
              </div>
              
              <div>
                <label htmlFor="target_exam" className="text-sm font-bold text-gray-600 dark:text-gray-300">Foco Principal (Exame)</label>
                <select
                  id="target_exam" name="target_exam"
                  value={formData.target_exam || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-dark-border"
                >
                  <option value="">Selecione seu foco...</option>
                  <option value="ENEM">ENEM</option>
                  <option value="FUVEST">FUVEST</option>
                  <option value="UNICAMP">UNICAMP</option>
                  <option value="UNESP">UNESP</option>
                  <option value="Concursos">Concursos Públicos</option>
                  <option value="Outros">Outros / Estudos Gerais</option>
                </select>
              </div>
            </div>

          </div>

          {/* BARRA DE AÇÕES */}
          <div className="mt-8 border-t pt-6 dark:border-gray-700 flex gap-4 justify-end">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setFormData(initialProfile); }} 
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !hasChanges} 
                  className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-royal-blue/30"
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}