import { useState, useCallback } from 'react';
import { generateImageBlob, shareNativeFile } from '@/utils/exportAsImage';
import { useToast } from '@/contexts/ToastContext';

export const useProfileShare = (profileName: string) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { addToast } = useToast();

    // Passo 1: Gerar a imagem e mostrar o preview
    const handleGenerate = useCallback(async (elementRef: HTMLElement | null) => {
        if (!elementRef) return;

        setIsGenerating(true);
        try {
            const file = await generateImageBlob(elementRef, `facillit-${profileName}`);
            
            if (file) {
                setPreviewFile(file);
                // Cria URL temporária para mostrar no modal
                setPreviewUrl(URL.createObjectURL(file)); 
            }
        } catch (error) {
            addToast({ 
                title: 'Erro ao criar imagem', 
                message: 'Tente novamente.', 
                type: 'error' 
            });
        } finally {
            setIsGenerating(false);
        }
    }, [profileName, addToast]);

    // Passo 2: Compartilhar o arquivo JÁ gerado
    const handleShare = useCallback(async () => {
        if (!previewFile) return;

        try {
            const shared = await shareNativeFile(
                previewFile, 
                'Meu Perfil Facillit', 
                `Confira meu perfil: ${window.location.origin}/u/${profileName}`
            );

            if (shared) {
                addToast({ title: 'Sucesso', message: 'Compartilhado!', type: 'success' });
            } else {
                // Fallback se navigator.share falhar
                addToast({ title: 'Atenção', message: 'Salve a imagem manualmente.', type: 'info' });
            }
        } catch (error) {
            console.error(error);
            // Não mostramos erro aqui pois o fallback visual (modal) já serve para isso
        }
    }, [previewFile, profileName, addToast]);

    const clearPreview = useCallback(() => {
        setPreviewFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }, [previewUrl]);

    return {
        isGenerating,
        previewUrl,   // Se existir, mostre o Modal
        handleGenerate,
        handleShare,  // Ligue isso no botão "Enviar" do Modal
        clearPreview
    };
};