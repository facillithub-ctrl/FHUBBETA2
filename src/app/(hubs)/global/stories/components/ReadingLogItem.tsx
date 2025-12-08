// CAMINHO: src/app/dashboard/applications/global/stories/components/ReadingLogItem.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image'; // Importado Image

export type ReadingLogData = {
  id: string;
  bookTitle: string;
  bookCover: string;
  totalPages: number;
  currentPage: number;
  lastUpdate: string;
  status: 'Lendo' | 'Pausado' | 'Concluído';
};

export default function ReadingLogItem({ log }: { log: ReadingLogData }) {
  const [currentPage, setCurrentPage] = useState(log.currentPage);
  const [isHovered, setIsHovered] = useState(false);

  const progress = Math.min(100, Math.round((currentPage / log.totalPages) * 100));

  const handleQuickUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPage = Math.min(log.totalPages, currentPage + 10);
    setCurrentPage(newPage);
  };

  return (
    <div 
      className="bg-white p-4 rounded-xl border border-gray-200 hover:border-brand-purple/40 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group mb-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="absolute bottom-0 left-0 h-1 bg-brand-purple transition-all duration-500 ease-out opacity-20" 
        style={{ width: `${progress}%` }}
      ></div>

      <div className="flex gap-3">
        {/* CORREÇÃO: next/image */}
        <div className="w-10 h-14 bg-gray-200 rounded shadow-sm flex-shrink-0 relative overflow-hidden">
             <Image src={log.bookCover} alt="Capa" fill className="object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
             <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
               log.status === 'Lendo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
             }`}>
               {log.status}
             </span>
             {isHovered && (
               <button 
                  onClick={handleQuickUpdate}
                  className="text-[10px] bg-brand-purple text-white px-2 py-0.5 rounded-full font-bold hover:bg-brand-dark transition-colors"
                  title="Simular leitura de +10 páginas"
               >
                 +10 pág
               </button>
             )}
          </div>
          
          <h4 className="font-bold text-gray-800 text-sm truncate leading-tight mb-2">{log.bookTitle}</h4>
          
          <div className="relative pt-1">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>{progress}% concluído</span>
              <span>{currentPage}/{log.totalPages}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-brand-purple rounded-full transition-all duration-700 ease-out" 
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}