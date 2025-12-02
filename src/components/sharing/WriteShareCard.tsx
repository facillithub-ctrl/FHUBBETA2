import React, { forwardRef } from 'react';
import Image from 'next/image';

interface WriteShareCardProps {
  studentName: string;
  theme: string;
  totalScore: number;
  date: string;
  competencies?: {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
  };
}

export const WriteShareCard = forwardRef<HTMLDivElement, WriteShareCardProps>(
  ({ studentName, theme, totalScore, date, competencies }, ref) => {
    
    // Cor da nota baseada no valor
    const getScoreColor = (score: number) => {
      if (score >= 900) return 'text-emerald-400';
      if (score >= 700) return 'text-blue-400';
      return 'text-white';
    };

    return (
      <div
        ref={ref}
        id="write-share-card"
        className="relative w-[1080px] h-[1350px] bg-[#0A0A0B] overflow-hidden flex flex-col font-sans"
        // Tamanho 1080x1350 é o padrão retrato ideal para Instagram/Stories
      >
        {/* --- Background Elements --- */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#4c1d95_0%,_#09090b_60%)] opacity-40" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-purple/10 blur-[120px] rounded-full" />

        {/* --- Conteúdo Principal --- */}
        <div className="relative z-10 flex flex-col h-full p-16 justify-between">
          
          {/* Header */}
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 relative">
                  <Image 
                    src="/assets/images/marcas/Write.png" 
                    alt="Facillit Write" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-white tracking-wide">Facillit Write</span>
             </div>
             <span className="text-white/40 text-xl font-medium">{date}</span>
          </div>

          {/* Centro: A Nota e o Tema */}
          <div className="flex flex-col items-center text-center space-y-8 mt-10">
            
            {/* Badge do Aluno */}
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-purple to-pink-500 p-[2px]">
                 <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">
                    {studentName.charAt(0).toUpperCase()}
                 </div>
               </div>
               <span className="text-2xl text-white/80 font-medium">Redação de {studentName}</span>
            </div>

            {/* A Grande Nota */}
            <div className="relative">
              <h1 className={`text-[240px] leading-none font-black ${getScoreColor(totalScore)} drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]`}>
                {totalScore}
              </h1>
              <div className="absolute -bottom-4 right-10 bg-white/10 px-4 py-1 rounded text-white/60 text-lg uppercase tracking-widest font-bold">
                Pontos
              </div>
            </div>

            {/* O Tema */}
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold text-white leading-tight">
                "{theme}"
              </h2>
            </div>
          </div>

          {/* Competências (Grid) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm mt-8">
            <div className="grid grid-cols-5 gap-4">
               {competencies && Object.entries(competencies).map(([key, value]) => (
                 <div key={key} className="flex flex-col items-center justify-center border-r border-white/10 last:border-0">
                    <span className="text-white/40 uppercase text-sm font-bold mb-2">{key.toUpperCase()}</span>
                    <span className="text-3xl font-bold text-white">{value}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center space-y-4 pt-10">
            <p className="text-white/50 text-xl">
              Corrigido com Inteligência Artificial em segundos.
            </p>
            <div className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold text-xl shadow-lg shadow-brand-purple/20">
              facillithub.com.br
            </div>
          </div>

        </div>
      </div>
    );
  }
);

WriteShareCard.displayName = 'WriteShareCard';