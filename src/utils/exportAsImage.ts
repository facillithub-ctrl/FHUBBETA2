import { toPng } from 'html-to-image';

// Proxy essencial para evitar bloqueio CORS no Safari iOS
const CORS_PROXY = "https://wsrv.nl/?url=";

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;

    try {
        // 1. Construir URL Otimizada (Resize + Proxy)
        let fetchUrl = url;
        if (url.startsWith('http') && !url.includes('wsrv.nl')) {
             // Redimensiona para 300x300 (ideal para o card) e força PNG
             fetchUrl = `${CORS_PROXY}${encodeURIComponent(url)}&w=300&h=300&output=png`;
        }

        // 2. Fetch direto (Mais leve que Canvas)
        const response = await fetch(fetchUrl, {
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) throw new Error('Falha no proxy de imagem');

        const blob = await response.blob();

        // 3. Converter para Base64
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
        console.warn("Avatar: Falha no carregamento otimizado:", e);
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
        
        // Delay para Safari renderizar layout (shadows/gradients)
        await new Promise(r => setTimeout(r, 500));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, 
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff', // Garante fundo branco sólido no PNG final
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
        if (error?.type === 'error') {
             throw new Error("Erro ao processar imagem do card.");
        }
        throw new Error(error.message || "Falha na geração.");
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