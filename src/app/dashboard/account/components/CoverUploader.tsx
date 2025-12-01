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

        // Validação básica de tamanho (ex: 2MB)
        if (file.size > 2 * 1024 * 1024) {
            addToast({ title: 'Arquivo muito grande', message: 'A capa deve ter no máximo 2MB.', type: 'error' });
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('covers') // Certifique-se que o bucket 'covers' existe
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(filePath);

            onUploadSuccess(publicUrl);
            addToast({ title: 'Capa atualizada', message: 'Ficou ótima!', type: 'success' });

        } catch (error: any) {
            addToast({ title: 'Erro no upload', message: error.message, type: 'error' });
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
                    <i className="fas fa-image text-3xl mb-2"></i>
                    <span className="text-sm font-medium">Adicionar Capa</span>
                </div>
            )}

            {/* Overlay de Loading ou Ação */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label htmlFor="cover-upload" className="cursor-pointer text-white font-bold flex items-center gap-2">
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