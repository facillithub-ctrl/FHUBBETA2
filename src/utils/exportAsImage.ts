import { toPng } from 'html-to-image';

const CORS_PROXY = "https://wsrv.nl/?url=";

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;

    try {
        let fetchUrl = url;
        // Redimensiona para economizar memória no iPhone, mas mantém qualidade (400px)
        if (url.startsWith('http') && !url.includes('wsrv.nl')) {
             fetchUrl = `${CORS_PROXY}${encodeURIComponent(url)}&w=400&h=400&output=png`;
        }

        const response = await fetch(fetchUrl, { mode: 'cors', cache: 'no-cache' });
        if (!response.ok) throw new Error('Falha no proxy');
        const blob = await response.blob();

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (base64 && base64.length > 100) resolve(base64);
                else resolve(null);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return null;
    }
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
        await new Promise(r => setTimeout(r, 500));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, // 540px * 2 = 1080px (Full HD)
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff', // Garante opacidade total
            fontEmbedCSS: "", 
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
        console.error("Erro html-to-image:", error);
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