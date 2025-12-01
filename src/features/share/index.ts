import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile, preloadImage } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string, avatarUrl?: string | null) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Estados para as versões Base64 (Seguras) das imagens
    const [safeAvatarUrl, setSafeAvatarUrl] = useState<string | null>(null);
    const [safeLogoUrl, setSafeLogoUrl] = useState<string | null>(null);

    const { addToast } = useToast();

    // 1. Preparação: Converte TUDO para Base64
    const prepareEnvironment = useCallback(async () => {
        // Converte Avatar
        if (avatarUrl) {
            const avatarBase64 = await preloadImage(avatarUrl);
            setSafeAvatarUrl(avatarBase64); // Se falhar, fica null (usa placeholder)
        }

        // Converte Logo Local (para garantir que o QR Code e o Header não travem)
        const logoBase64 = await preloadImage('/assets/images/accont.svg');
        setSafeLogoUrl(logoBase64);

    }, [avatarUrl]);

    // 2. Gerar Imagem
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

    // 3. Compartilhar
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
        safeLogoUrl, // Novo export
        prepareEnvironment,
        handleGenerate,
        handleShare,
        clearPreview
    };
};