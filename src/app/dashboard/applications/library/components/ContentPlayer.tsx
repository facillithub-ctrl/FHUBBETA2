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
    // Chama a server action para dar XP e marcar como lido
    await completeContent(content.id);
    setCompleted(true);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fade-in">
      {/* Header do Player */}
      <div className="h-16 bg-gray-900 flex items-center justify-between px-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
                <h1 className="text-white font-bold text-sm md:text-base line-clamp-1">{content.title}</h1>
                <p className="text-gray-400 text-xs">{content.author || 'Conteúdo Oficial'}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            {!completed ? (
                <button 
                    onClick={handleComplete}
                    className="bg-royal-blue text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <i className="far fa-circle"></i> Marcar como Concluído
                </button>
            ) : (
                <span className="text-green-400 text-xs font-bold flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <i className="fas fa-check-circle"></i> Concluído (+150 XP)
                </span>
            )}
        </div>
      </div>

      {/* Área de Visualização */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {content.content_type === 'video' ? (
             <video 
                src={content.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-full w-full h-full object-contain"
                onEnded={() => !completed && handleComplete()} 
             />
        ) : content.content_type === 'book' || content.content_type === 'slide' || content.url.endsWith('.pdf') ? (
             <iframe 
                src={`${content.url}#toolbar=0`} 
                className="w-full h-full border-none" 
                title="PDF Viewer"
             />
        ) : (
            // Fallback para outros tipos (Download)
            <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-download text-3xl text-gray-400"></i>
                </div>
                <p className="text-gray-300 mb-4">Este formato deve ser baixado para visualização.</p>
                <a 
                    href={content.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:opacity-90"
                >
                    Baixar Arquivo
                </a>
            </div>
        )}
      </div>
    </div>
  );
}