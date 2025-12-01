import { toPng } from 'html-to-image';

const CORS_PROXY = "https://wsrv.nl/?url=";

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;

    const tryFetch = async (targetUrl: string): Promise<string | null> => {
        try {
            const response = await fetch(targetUrl, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    resolve(base64 && base64.length > 100 ? base64 : null);
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return null;
        }
    };

    if (url.startsWith('http') && !url.includes('wsrv.nl')) {
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}&w=400&h=400&output=png`;
        const result = await tryFetch(proxyUrl);
        if (result) return result;
    }

    return await tryFetch(url);
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
        await new Promise(r => setTimeout(r, 400));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 3, // Ultra Sharp
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff', // Branco Sólido = Zero Manchas
            fontEmbedCSS: "", 
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left'
            },
            filter: (node) => {
                if (node.tagName === 'LINK') return false;
                if (node.tagName === 'I') return false; 
                return true;
            }
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        return new File([blob], `${fileName}.png`, { type: 'image/png' });

    } catch (error: any) {
        console.error("Erro renderização:", error);
        throw new Error("Falha na geração.");
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