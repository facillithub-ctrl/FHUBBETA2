"use client";

import { useState, useTransition } from 'react';
import type { UserProfile } from '../../types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import AvatarUploader from '../../profile/AvatarUploader'; 
import { updateAccountProfile } from '../actions';

type Props = {
  userProfile: UserProfile;
  fullProfileData: any; // Recebe todos os dados, incl. category_details
};

export default function ProfileInfo({ userProfile, fullProfileData }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // 1. Estado de Edição: Controla se os campos estão bloqueados
  const [isEditing, setIsEditing] = useState(false);

  // 2. Estado do Formulário: Um único objeto para os dados
  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || '',
    nickname: userProfile.nickname || '',
    birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
    avatarUrl: userProfile.avatarUrl || null,
    country: fullProfileData.category_details?.country || 'Brasil',
    language: fullProfileData.category_details?.language || 'Português (Brasil)',
    bio: fullProfileData.category_details?.bio || '',
  });

  // 3. ID Facillit (apenas leitura)
  const facillitId = fullProfileData.facillit_id || 'FHB_???-???'; 

  // 4. Função de Salvar
  const handleUpdate = async () => {
    startTransition(async () => {
      const result = await updateAccountProfile({
        fullName: formData.fullName,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        // CORREÇÃO AQUI: O operador '??' garante que se for null, envia undefined
        avatarUrl: formData.avatarUrl ?? undefined, 
        country: formData.country,
        language: formData.language,
        bio: formData.bio,
      });

      if (result.error) {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      } else {
        addToast({ title: 'Sucesso!', message: 'Perfil atualizado.', type: 'success' });
        setIsEditing(false); // Bloqueia os campos
        router.refresh(); // Recarrega os dados do servidor
      }
    });
  };

  // 5. Função de Cancelar: Restaura os dados originais
  const handleCancel = () => {
    setFormData({
      fullName: userProfile.fullName || '',
      nickname: userProfile.nickname || '',
      birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
      avatarUrl: userProfile.avatarUrl || null,
      country: fullProfileData.category_details?.country || 'Brasil',
      language: fullProfileData.category_details?.language || 'Português (Brasil)',
      bio: fullProfileData.category_details?.bio || '',
    });
    setIsEditing(false); // Bloqueia os campos
  };

  // Callback para quando o AvatarUploader termina o upload
  const handleAvatarUploadSuccess = (newUrl: string) => {
    // Atualiza o estado do formulário local com o novo URL
    setFormData(prev => ({ ...prev, avatarUrl: newUrl }));
    addToast({ title: 'Foto de perfil carregada!', message: 'Clique em "Salvar" para aplicar a alteração.', type: 'success' });
  };
  
  // Helper para atualizar o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Perfil e Informações Pessoais</h2>
      <p className="text-text-secondary mb-8">Atualize sua foto e detalhes pessoais.</p>

      {/* Upload de Avatar */}
      <div className="pb-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Foto de Perfil</h3>
        {/* 6. O AvatarUploader agora é desativado se 'isEditing' for falso */}
        <AvatarUploader 
          profile={{...userProfile, avatarUrl: formData.avatarUrl}} // Mostra a imagem do estado
          onUploadSuccess={handleAvatarUploadSuccess} 
          disabled={!isEditing}
        />
      </div>

      {/* Dados Pessoais */}
      <div className="py-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome Completo */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
          {/* Apelido */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-text-secondary mb-1">Apelido</label>
            <input 
              type="text" 
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
          {/* Data de Nascimento */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-text-secondary mb-1">Data de Nascimento</label>
            <input 
              type="date" 
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
          {/* País */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">País</label>
            <input 
              type="text" 
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
          {/* Idioma */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-1">Idioma</label>
            <input 
              type="text" 
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
          {/* Biografia */}
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">Biografia Curta</label>
            <textarea 
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing} // 7. Desativado por defeito
              placeholder="Fale um pouco sobre você..."
              className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Identidade */}
      <div className="py-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Identidade no Ecossistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="facillitId" className="block text-sm font-medium text-text-secondary mb-1">ID Facillit</label>
            <input 
              type="text" 
              id="facillitId"
              value={facillitId.toUpperCase()}
              disabled
              className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-text-secondary mb-1">Domínio Institucional</label>
            <input 
              type="text" 
              id="domain"
              value={userProfile.organization_id ? (userProfile.schoolName || 'Instituição Vinculada') : 'Conta Individual'}
              disabled
              className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
      </div>
      
      {/* 8. Botões de Ação (Salvar / Editar / Cancelar) */}
      <div className="flex justify-end gap-4 mt-8">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="py-3 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg dark:bg-gray-700 dark:text-text-primary"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
          >
            Editar Perfil
          </button>
        )}
      </div>
    </div>
  );
}