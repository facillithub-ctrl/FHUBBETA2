import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile, preloadImage } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string, avatarUrl?: string | null) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [safeAvatarUrl, setSafeAvatarUrl] = useState<string | null>(null);

    const { addToast } = useToast();

    // 1. Converte avatar para Base64 assim que possível
    const prepareEnvironment = useCallback(async () => {
        if (avatarUrl) {
            const base64 = await preloadImage(avatarUrl);
            setSafeAvatarUrl(base64); // Se falhar, é null
        }
    }, [avatarUrl]);

    // 2. Gera a imagem
    const handleGenerate = useCallback(async (elementRef: HTMLElement | null) => {
        if (!elementRef) return;

        setIsGenerating(true);
        setPreviewFile(null);

        try {
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

    // 3. Compartilha
    const handleShare = useCallback(async () => {
        if (!previewFile) return;
        
        const success = await shareNativeFile(
            previewFile, 
            'Meu Perfil Facillit', 
            `Acesse: ${window.location.origin}/u/${profileName}`
        );

        if (success) {
            addToast({ title: 'Sucesso', message: 'Iniciando...', type: 'success' });
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