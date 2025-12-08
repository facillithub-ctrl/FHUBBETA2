'use client'
import { useState } from 'react';
import { completeContent } from '../actions';

interface ContentPlayerProps {
  content: any;
  onClose: () => void;
}

export default function ContentPlayer({ content, onClose }: ContentPlayerProps) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    await completeContent(content.id);
    setCompleted(true);
  };

  const isPdf = content.content_type === 'book' || content.content_type === 'slide' || content.url?.endsWith('.pdf');
  const isVideo = content.content_type === 'video' || content.url?.endsWith('.mp4');

  // URL segura para visualização de PDF em mobile e desktop
  const getPdfViewerUrl = (url: string) => {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fade-in">
      {/* Header do Player */}
      <div className="h-16 bg-gray-900 flex items-center justify-between px-4 md:px-6 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
                <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div className="overflow-hidden">
                <h1 className="text-white font-bold text-sm md:text-base truncate">{content.title}</h1>
                <p className="text-gray-400 text-xs truncate">{content.author || 'Conteúdo Oficial'}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            {!completed ? (
                <button 
                    onClick={handleComplete}
                    className="bg-royal-blue text-white px-3 md:px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    <i className="far fa-circle"></i> <span className="hidden md:inline">Marcar como Concluído</span> <span className="md:hidden">Concluir</span>
                </button>
            ) : (
                <span className="text-green-400 text-xs font-bold flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <i className="fas fa-check-circle"></i> <span className="hidden md:inline">Concluído (+150 XP)</span> <span className="md:hidden">Feito</span>
                </span>
            )}
        </div>
      </div>

      {/* Área de Visualização */}
      <div className="flex-1 bg-black relative flex items-center justify-center w-full h-full">
        {isVideo ? (
             <video 
                src={content.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-full w-full h-full object-contain"
                onEnded={() => !completed && handleComplete()} 
             />
        ) : isPdf ? (
             <div className="w-full h-full bg-white relative">
                 {/* Iframe usando Google Docs Viewer para garantir compatibilidade Mobile */}
                 <iframe 
                    src={getPdfViewerUrl(content.url)} 
                    className="w-full h-full border-none block" 
                    title="PDF Viewer"
                    allowFullScreen
                 />
                 {/* Botão de fallback caso falhe */}
                 <a 
                    href={content.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-black z-10 flex items-center gap-2"
                 >
                    <i className="fas fa-external-link-alt"></i> Abrir Original
                 </a>
             </div>
        ) : (
            // Fallback Genérico (Download)
            <div className="text-center p-6">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <i className="fas fa-download text-3xl text-gray-400"></i>
                </div>
                <p className="text-gray-300 mb-4 max-w-xs mx-auto">Este formato não suporta visualização direta no navegador.</p>
                <a 
                    href={content.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:opacity-90 inline-block shadow-lg active:scale-95 transition-transform"
                >
                    Baixar Arquivo
                </a>
            </div>
        )}
      </div>
    </div>
  );
}