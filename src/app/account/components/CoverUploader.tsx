"use client";

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useToast } from '@/contexts/ToastContext';

interface CoverUploaderProps {
    userId: string;
    currentUrl: string | null;
    onUploadSuccess: (url: string) => void;
}

export default function CoverUploader({ userId, currentUrl, onUploadSuccess }: CoverUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();
    const { addToast } = useToast();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Limite de 2MB para não sobrecarregar
        if (file.size > 2 * 1024 * 1024) {
            addToast({ title: 'Arquivo muito grande', message: 'A capa deve ter no máximo 2MB.', type: 'error' });
            return;
        }

        setUploading(true);
        // Caminho único para evitar cache aggressive
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-cover-${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        try {
            // Upload para o bucket 'covers'
            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Pega a URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(filePath);

            onUploadSuccess(publicUrl);
            addToast({ title: 'Sucesso', message: 'Capa atualizada!', type: 'success' });

        } catch (error: any) {
            console.error(error);
            addToast({ title: 'Erro no upload', message: 'Verifique se a imagem é válida.', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative w-full h-32 md:h-48 rounded-xl overflow-hidden group bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-purple transition-all">
            {currentUrl ? (
                <Image
                    src={currentUrl}
                    alt="Capa"
                    fill
                    className={`object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                        <i className="fas fa-image text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Adicionar Capa</span>
                </div>
            )}

            {/* Overlay de Ação */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label htmlFor="cover-upload" className="cursor-pointer text-white font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
                    <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
                    {uploading ? 'Enviando...' : 'Trocar Capa'}
                </label>
            </div>

            <input
                type="file"
                id="cover-upload"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                disabled={uploading}
                className="hidden"
            />
        </div>
    );
}