import { toPng } from 'html-to-image';

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;
    
    return new Promise((resolve) => {
        const img = new Image();
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
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (e) {
                    console.warn("CORS bloqueou conversão Base64:", e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };

        img.onerror = () => {
            console.warn("Falha ao carregar imagem:", url);
            resolve(null);
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
        await new Promise(r => setTimeout(r, 300));

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
             throw new Error("Bloqueio de segurança (CORS) em imagem.");
        }
        throw new Error(error.message || "Falha ao gerar.");
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