import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile, preloadImage } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string, avatarUrl?: string | null) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Avatar Seguro: Começa undefined.
    const [safeAvatarUrl, setSafeAvatarUrl] = useState<string | null | undefined>(undefined);
    const { addToast } = useToast();

    // ETAPA 1: Preparação Segura
    const prepareEnvironment = useCallback(async () => {
        if (!avatarUrl) {
            setSafeAvatarUrl(null);
            return;
        }
        
        // Evita rodar duas vezes
        if (safeAvatarUrl !== undefined) return;

        try {
            const localUrl = await preloadImage(avatarUrl);
            // Se localUrl for null (erro CORS), setamos null para usar o Placeholder.
            // Isso garante que o html-to-image NUNCA trave por rede.
            setSafeAvatarUrl(localUrl);
        } catch (e) {
            setSafeAvatarUrl(null); 
        }
    }, [avatarUrl, safeAvatarUrl]);

    // ETAPA 2: Geração com Tratamento de Erro
    const handleGenerate = useCallback(async (elementRef: HTMLElement | null) => {
        if (!elementRef) return;

        setIsGenerating(true);
        // Limpa preview anterior para forçar reload visual
        setPreviewUrl(null); 

        try {
            // Timeout manual de 8s para não ficar carregando infinitamente
            const timeoutPromise = new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error("O tempo limite excedeu (8s).")), 8000)
            );

            const filePromise = generateImageBlob(elementRef, `facillit-${profileName}`);
            
            const file = await Promise.race([filePromise, timeoutPromise]);
            
            if (file) {
                setPreviewFile(file);
                setPreviewUrl(URL.createObjectURL(file)); 
            }
        } catch (error: any) {
            console.error("Falha HandleGenerate:", error);
            const msg = error.message?.includes("tempo limite") 
                ? "Demorou muito. Tente novamente." 
                : "Erro ao criar imagem. Tente de novo.";
            addToast({ title: 'Erro', message: msg, type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    }, [profileName, addToast]);

    // ETAPA 3: Compartilhar
    const handleShare = useCallback(async () => {
        if (!previewFile) return;
        
        const success = await shareNativeFile(
            previewFile, 
            'Meu Perfil Facillit', 
            `Confira meu perfil: ${window.location.origin}/u/${profileName}`
        );

        if (success) {
            addToast({ title: 'Sucesso', message: 'Compartilhamento iniciado.', type: 'success' });
        } else {
            addToast({ title: 'Info', message: 'Salve a imagem manualmente.', type: 'info' });
        }
    }, [previewFile, profileName, addToast]);

    const clearPreview = useCallback(() => {
        setPreviewFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
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