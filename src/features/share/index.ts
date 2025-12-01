import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile, preloadImage } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string, avatarUrl?: string | null) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [safeAvatarUrl, setSafeAvatarUrl] = useState<string | null>(null);
    const [safeLogoUrl, setSafeLogoUrl] = useState<string | null>(null);

    const { addToast } = useToast();

    const prepareEnvironment = useCallback(async () => {
        if (avatarUrl) {
            const avatarBase64 = await preloadImage(avatarUrl);
            setSafeAvatarUrl(avatarBase64); 
        }
        const logoBase64 = await preloadImage('/assets/images/accont.svg');
        setSafeLogoUrl(logoBase64);
    }, [avatarUrl]);

    const handleGenerate = useCallback(async (elementRef: HTMLElement | null) => {
        if (!elementRef) return;

        setIsGenerating(true);
        setPreviewFile(null);

        try {
            const fileName = `facillit-${profileName.replace(/[^a-z0-9]/gi, '_')}`;
            // Sempre branco para esta versão clean
            const file = await generateImageBlob(elementRef, fileName, '#ffffff');
            
            if (file) {
                setPreviewFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                throw new Error("Arquivo vazio");
            }
        } catch (error) {
            addToast({ title: 'Erro', message: 'Tente novamente.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    }, [profileName, addToast]);

    const handleShare = useCallback(async () => {
        if (!previewFile) return;
        
        const success = await shareNativeFile(
            previewFile, 
            'Meu Perfil Facillit', 
            `Acesse: ${window.location.origin}/u/${profileName}`
        );

        if (success) {
            addToast({ title: 'Sucesso', message: 'Abrindo...', type: 'success' });
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
        safeLogoUrl,
        prepareEnvironment,
        handleGenerate,
        handleShare,
        clearPreview
    };
};