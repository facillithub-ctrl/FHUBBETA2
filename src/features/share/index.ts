import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile, preloadImage } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string, avatarUrl?: string | null) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [safeAvatarUrl, setSafeAvatarUrl] = useState<string | null>(null);

    const { addToast } = useToast();

    // 1. Preload (chamado ao abrir menu)
    const prepareEnvironment = useCallback(async () => {
        if (avatarUrl) {
            // Tenta criar URL segura. Se falhar, retorna null e o componente usa o ícone cinza.
            const url = await preloadImage(avatarUrl);
            setSafeAvatarUrl(url);
        }
    }, [avatarUrl]);

    // 2. Gerar (chamado pelo botão)
    const handleGenerate = useCallback(async (elementRef: HTMLElement | null) => {
        if (!elementRef) return;

        setIsGenerating(true);
        setPreviewFile(null); // Limpa anterior

        try {
            // Nome do arquivo
            const fileName = `facillit-${profileName.replace(/[^a-z0-9]/gi, '_')}`;
            
            const file = await generateImageBlob(elementRef, fileName);
            
            if (file) {
                setPreviewFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                throw new Error("Arquivo vazio");
            }
        } catch (error) {
            console.error(error);
            addToast({ title: 'Erro', message: 'Tente novamente.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    }, [profileName, addToast]);

    // 3. Compartilhar (chamado no modal)
    const handleShare = useCallback(async () => {
        if (!previewFile) return;
        
        const success = await shareNativeFile(
            previewFile, 
            'Meu Perfil Facillit', 
            `Acesse: ${window.location.origin}/u/${profileName}`
        );

        if (success) {
            addToast({ title: 'Sucesso', message: 'Compartilhamento iniciado.', type: 'success' });
        } else {
            addToast({ title: 'Atenção', message: 'Salve a imagem manualmente.', type: 'info' });
        }
    }, [previewFile, profileName, addToast]);

    const clearPreview = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewFile(null);
    }, [previewUrl]);

    return {
        isGenerating,
        previewUrl,
        safeAvatarUrl,
        prepareEnvironment,
        handleGenerate,
        handleShare,
        clearPreview
    };
};