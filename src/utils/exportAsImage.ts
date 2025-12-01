import { toPng } from 'html-to-image';

// Proxy gratuito de alta performance que adiciona CORS headers automaticamente
// Isso resolve o problema do Supabase/Safari sem configuração no servidor.
const CORS_PROXY = "https://wsrv.nl/?url=";

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;
    
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        
        // LÓGICA MÁGICA:
        // Se for uma URL remota (não data: ou /assets), passamos pelo proxy.
        // Adicionamos &output=png para garantir compatibilidade.
        let safeUrl = url;
        if (url.startsWith('http')) {
            // EncodeURIComponent é vital para URLs com caracteres especiais
            safeUrl = `${CORS_PROXY}${encodeURIComponent(url)}&output=png`;
        }
        
        img.src = safeUrl;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                try {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (e) {
                    console.warn("CORS ainda bloqueou (improvável com proxy):", e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };

        img.onerror = () => {
            // Se o proxy falhar, tentamos a URL original como última esperança
            if (url.startsWith('http') && safeUrl.includes('wsrv.nl')) {
                console.warn("Proxy falhou, tentando direto...");
                // Recursão simples para tentar sem proxy
                const rawImg = new Image();
                rawImg.crossOrigin = 'anonymous';
                rawImg.src = url;
                rawImg.onload = function() {
                     // Lógica de canvas repetida simplificada
                     const c = document.createElement('canvas');
                     c.width = rawImg.width; c.height = rawImg.height;
                     c.getContext('2d')?.drawImage(rawImg,0,0);
                     try { resolve(c.toDataURL('image/png')); } catch { resolve(null); }
                };
                rawImg.onerror = () => resolve(null);
            } else {
                resolve(null);
            }
        };
    });
}

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
        
        // Delay para o Safari (iOS)
        await new Promise(r => setTimeout(r, 500));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, 
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", 
            filter: (node) => {
                if (node.tagName === 'LINK') return false;
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
             throw new Error("Erro de imagem. O Proxy tentou ajudar mas falhou.");
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