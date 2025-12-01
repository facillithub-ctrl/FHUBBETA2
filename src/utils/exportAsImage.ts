import { toPng } from 'html-to-image';

// Pré-carregador robusto
export async function preloadImage(url: string): Promise<string | null> {
    if (!url) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        img.src = url;
        
        img.onload = () => {
            // Técnica do Canvas Intermediário para garantir "limpeza" do buffer
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    canvas.toBlob((blob) => {
                        if (blob) resolve(URL.createObjectURL(blob));
                        else resolve(null);
                    });
                } catch (e) {
                    console.warn("Avatar: Bloqueio de CORS detectado.", e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };

        img.onerror = () => {
            console.warn("Avatar: Falha ao carregar imagem.", url);
            resolve(null);
        };
    });
}

export async function generateImageBlob(element: HTMLElement, fileName: string): Promise<File | null> {
    if (!element) return null;

    try {
        await document.fonts.ready;
        // Pequeno delay para garantir estabilidade do DOM off-screen
        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, 
            cacheBust: true,
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            fontEmbedCSS: "", // Vital para evitar crash de fontes
            filter: (node) => {
                // Filtra tags que costumam quebrar a exportação no Safari
                if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') return false;
                return true;
            }
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        return new File([blob], `${fileName}.png`, { type: 'image/png' });

    } catch (error: any) {
        console.error("Erro interno html-to-image:", error);
        
        // Se o erro for um Evento de DOM (como o erro de imagem), transformamos em texto legível
        if (error.target && error.type === 'error') {
             throw new Error("Bloqueio de segurança na imagem do card. Usando placeholder.");
        }
        
        throw new Error(error.message || "Falha na renderização do Card.");
    }
}

export async function shareNativeFile(file: File, title: string, text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
    
    const shareData = { files: [file], title, text };
    
    if (navigator.canShare && !navigator.canShare(shareData)) {
        return false;
    }

    try {
        await navigator.share(shareData);
        return true;
    } catch (err: any) {
        if (err.name === 'AbortError') return true;
        console.error("Erro no Share:", err);
        return false;
    }
}