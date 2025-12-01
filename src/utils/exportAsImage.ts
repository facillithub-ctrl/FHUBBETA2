import { toPng } from 'html-to-image';

// Proxy que adiciona CORS e REDIMENSIONA a imagem (Vital para Mobile)
const CORS_PROXY = "https://wsrv.nl/?url=";

export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;

    try {
        // 1. Construir URL Otimizada
        // Adicionamos &w=200&h=200 para garantir que o iPhone não baixe uma imagem 4K
        let fetchUrl = url;
        if (url.startsWith('http')) {
             fetchUrl = `${CORS_PROXY}${encodeURIComponent(url)}&w=200&h=200&output=png`;
        }

        // 2. Download Direto (Fetch)
        // Isso é mais leve que criar um elemento <img> e desenhar em <canvas>
        const response = await fetch(fetchUrl, {
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) throw new Error('Falha no proxy');

        const blob = await response.blob();

        // 3. Converter Blob para Base64
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Validação extra: Se o base64 for muito curto, falhou
                if (base64 && base64.length > 100) {
                    resolve(base64);
                } else {
                    resolve(null);
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });

    } catch (e) {
        console.warn("Avatar: Falha no download otimizado:", e);
        return null;
    }
}

// Garante que o DOM está estável
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
        
        // Delay para o Safari iOS renderizar o layout
        await new Promise(r => setTimeout(r, 500));

        const dataUrl = await toPng(element, {
            quality: 1.0, // PNG usa 1.0
            pixelRatio: 2, // 2x é nítido e seguro para mobile
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", 
            filter: (node) => {
                // Filtra tags que o Safari odeia
                if (node.tagName === 'LINK') return false;
                if (node.tagName === 'I') return false; // FontAwesome antigo
                return true;
            }
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        return new File([blob], `${fileName}.png`, { type: 'image/png' });

    } catch (error: any) {
        console.error("Erro no html-to-image:", error);
        if (error?.type === 'error') {
             throw new Error("Erro de imagem. Otimização falhou.");
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
        // Se o usuário cancelar, não é erro
        if (err.name === 'AbortError') return true;
        return false;
    }
}