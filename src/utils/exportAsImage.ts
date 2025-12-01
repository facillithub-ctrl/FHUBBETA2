import { toBlob } from 'html-to-image';

/**
 * Converte um elemento HTML em um arquivo de imagem pronto para compartilhamento.
 * Usa configurações otimizadas para Safari/iOS e evita erros de fonte.
 */
export async function generateImageBlob(element: HTMLElement, fileName: string): Promise<File | null> {
    if (!element) return null;

    try {
        // 1. Forçar carregamento de fontes antes de renderizar
        await document.fonts.ready;
        
        // 2. Pequeno delay para garantir que estilos CSS foram aplicados
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 3. Conversão otimizada
        const blob = await toBlob(element, {
            quality: 0.9,
            pixelRatio: 1.5, // Equilíbrio entre qualidade e performance mobile
            cacheBust: true, 
            skipAutoScale: true,
            backgroundColor: '#ffffff',
            
            // --- CORREÇÃO DO ERRO ---
            // Isso impede que a biblioteca tente baixar/parsear CSS externos quebrados.
            // As fontes carregadas no navegador ainda aparecerão visualmente.
            fontEmbedCSS: "", 
            
            // Filtro para ignorar elementos indesejados
            filter: (node) => !node.classList?.contains('ignore-export')
        });

        if (!blob) throw new Error("Falha na geração do Blob");

        // 4. Cria o objeto File real
        return new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
    } catch (error) {
        console.error("Erro no exportAsImage:", error);
        return null; 
    }
}

/**
 * Tenta invocar o compartilhamento nativo do dispositivo.
 * Retorna TRUE se conseguiu abrir o menu, FALSE se não suportado.
 */
export async function shareNativeFile(file: File, title: string, text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
        return false;
    }
    
    const shareData = {
        files: [file],
        title: title,
        text: text
    };

    // Valida se o navegador aceita especificamente ESSE arquivo
    if (navigator.canShare && !navigator.canShare(shareData)) {
        return false;
    }

    try {
        await navigator.share(shareData);
        return true;
    } catch (err: any) {
        if (err.name === 'AbortError') return true;
        console.error("Erro ao chamar navigator.share:", err);
        return false;
    }
}