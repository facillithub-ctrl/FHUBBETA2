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

// Gera o arquivo (Blob) da imagem a partir do HTML
export async function generateImageBlob(element: HTMLElement, fileName: string, bgColor: string = '#ffffff'): Promise<File | null> {
    if (!element) return null;

    try {
        await document.fonts.ready;
        await waitForImages(element);
        await new Promise(r => setTimeout(r, 400));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 3, 
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: bgColor,
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

// Função para tentar compartilhamento nativo (Mobile)
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

// --- FUNÇÃO QUE FALTAVA ---
// Esta função orquestra a geração e o download no navegador
export async function exportAsImage(element: HTMLElement, fileName: string): Promise<void> {
    const file = await generateImageBlob(element, fileName);
    if (!file) throw new Error("Falha ao gerar imagem");

    // Tenta compartilhamento nativo primeiro (bom para mobile)
    const shared = await shareNativeFile(file, "Compartilhar", "Confira este post!");
    
    // Se não suportar nativo ou falhar (desktop), força o download via link
    if (!shared) {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}