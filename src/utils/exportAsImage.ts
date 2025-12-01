import { toPng } from 'html-to-image';

// Converte URL (remota ou local) para Base64 (Data URI)
export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;
    
    return new Promise((resolve) => {
        const img = new Image();
        // crossOrigin 'anonymous' é necessário para imagens externas (Supabase/S3)
        // Para locais, não faz mal, mas ajuda se o asset for servido via CDN
        img.crossOrigin = 'anonymous'; 
        img.src = url;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                try {
                    ctx.drawImage(img, 0, 0);
                    // Retorna a string Base64 (data:image/png;base64...)
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (e) {
                    console.warn("CORS bloqueou a conversão para Base64:", url, e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };

        img.onerror = () => {
            console.warn("Falha ao carregar imagem para conversão:", url);
            resolve(null);
        };
    });
}

// Garante que todas as imagens no DOM carregaram antes da captura
async function waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
        });
    });
    if (promises.length > 0) await Promise.all(promises);
}

export async function generateImageBlob(element: HTMLElement, fileName: string): Promise<File | null> {
    if (!element) return null;

    try {
        await document.fonts.ready;
        await waitForImages(element);
        
        // Delay crítico para o Safari processar o layout
        await new Promise(r => setTimeout(r, 300));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, // 2x é o ideal para mobile
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Evita crash de fontes externas
            // Filtra tags problemáticas
            filter: (node) => {
                // Remove qualquer tag <link> (fontes externas/CSS)
                if (node.tagName === 'LINK') return false;
                // Remove ícones do FontAwesome se existirem dentro do card
                if (node.tagName === 'I' && (node as HTMLElement).className?.includes('fa-')) return false;
                return true;
            }
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        return new File([blob], `${fileName}.png`, { type: 'image/png' });

    } catch (error: any) {
        console.error("Erro no html-to-image:", error);
        if (error?.type === 'error') {
             throw new Error("O navegador bloqueou uma imagem (CORS).");
        }
        throw new Error(error.message || "Falha ao gerar imagem.");
    }
}

export async function shareNativeFile(file: File, title: string, text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
    
    const shareData = { files: [file], title, text };
    
    if (navigator.canShare && !navigator.canShare(shareData)) return false;

    try {
        await navigator.share(shareData);
        return true;
    } catch (err: any) {
        if (err.name === 'AbortError') return true;
        return false;
    }
}