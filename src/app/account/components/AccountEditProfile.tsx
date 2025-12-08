'use client';

import React, { useState } from 'react';
// CORREÇÃO: Remover as chaves { } do createClient
import createClient from '@/utils/supabase/client'; 
// Ajuste o caminho dos tipos se necessário. Se types.ts estiver em src/app/account/types.ts, use '../types'
import { UserProfile } from '../../types'; 
import { useToast } from '@/contexts/ToastContext';
import AvatarUploader from './AvatarUploader'; 
import CoverUploader from './CoverUploader';
import { Save, Loader2 } from 'lucide-react';

export default function AccountEditProfile({ profile }: { profile: UserProfile }) {
  const supabase = createClient();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Estado local para o formulário
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url,
    cover_url: profile?.cover_url
  });

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      addToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Seção de Imagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-500 mb-4 w-full text-left">Foto de Perfil</h3>
            <AvatarUploader 
                url={formData.avatar_url}
                onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
            />
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-500 mb-4 w-full text-left">Capa do Perfil</h3>
            <CoverUploader
                url={formData.cover_url}
                onUpload={(url) => setFormData({ ...formData, cover_url: url })}
            />
        </div>
      </div>

      {/* Formulário de Dados */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Nome Completo</label>
                <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-neutral-200 focus:border-blue-500 outline-none transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Nome de Usuário</label>
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-3 rounded-xl border border-neutral-200 focus:border-blue-500 outline-none transition-all"
                />
            </div>
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Website</label>
            <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://seu-site.com"
                className="w-full p-3 rounded-xl border border-neutral-200 focus:border-blue-500 outline-none transition-all"
            />
        </div>

        <div className="pt-4 flex justify-end">
            <button
                onClick={updateProfile}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Alterações
            </button>
        </div>
      </div>
    </div>
  );
}