import { toBlob } from 'html-to-image';

// Utilitário para pré-carregar a imagem. 
// Se falhar (CORS/Erro), retorna NULL para não quebrar o canvas.
export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;
    try {
        const res = await fetch(url, { mode: 'cors', cache: 'no-cache' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.warn("Avatar falhou no preload (será ignorado na geração):", e);
        return null;
    }
}

export async function generateImageBlob(element: HTMLElement, fileName: string): Promise<File | null> {
    if (!element) return null;

    try {
        // 1. Aguarda fontes (rápido)
        try { await document.fonts.ready; } catch {}
        
        // 2. Pequeno delay para layout
        await new Promise(r => setTimeout(r, 100));

        // 3. Renderização ÚNICA e Otimizada
        // skipAutoScale e pixelRatio reduzido ajudam no iOS
        const blob = await toBlob(element, {
            quality: 0.9,
            pixelRatio: 1.5, // 1.5 é seguro para iOS. 2.0+ costuma travar.
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Previne crash de fontes
        });

        if (!blob) throw new Error("Blob gerado veio vazio.");

        return new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });

    } catch (error: any) {
        // Log detalhado para mobile (usando stringify para ver objetos vazios)
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Erro na geração:", error);
        throw new Error(errorMsg);
    }
}

export async function shareNativeFile(file: File, title: string, text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
    
    const shareData = { files: [file], title, text };
    
    if (navigator.canShare && !navigator.canShare(shareData)) {
        console.warn("Navegador diz que não pode compartilhar este arquivo.");
        return false;
    }

    try {
        await navigator.share(shareData);
        return true;
    } catch (err: any) {
        if (err.name === 'AbortError') return true; 
        console.error("Erro no Share API:", err);
        return false;
    }
}