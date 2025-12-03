// CAMINHO: src/app/dashboard/applications/global/stories/components/QuoteCard.tsx
"use client";

import { useState } from 'react';

export type QuoteData = {
  id: string;
  text: string;
  bookTitle: string;
  author: string;
  page?: number;
  theme: 'dark' | 'light' | 'paper' | 'gradient';
};

export default function QuoteCard({ quote }: { quote: QuoteData }) {
  const [copied, setCopied] = useState(false);

  // Configuração visual dos temas
  const themes = {
    dark: "bg-[#1a1a1a] text-white font-serif",
    light: "bg-white text-gray-800 font-serif border border-gray-200 shadow-sm",
    paper: "bg-[#fdfbf7] text-[#2c2c2c] font-serif border border-[#e8e4d9] shadow-sm", // Estilo papel antigo
    gradient: "bg-gradient-to-br from-brand-purple to-indigo-900 text-white font-sans"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" - ${quote.bookTitle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-8 rounded-2xl relative mb-6 transition-all hover:scale-[1.01] ${themes[quote.theme]} group`}>
      
      {/* Ícone Decorativo */}
      <i className="fas fa-quote-left text-4xl opacity-10 absolute top-6 left-6"></i>

      <div className="relative z-10 text-center px-4">
        <blockquote className="text-xl md:text-2xl italic leading-relaxed font-medium mb-6">
          "{quote.text}"
        </blockquote>
        
        <div className="flex flex-col items-center gap-1 opacity-80">
          <div className="h-px w-12 bg-current mb-3 opacity-50"></div>
          <p className="text-sm font-bold uppercase tracking-widest">{quote.bookTitle}</p>
          <p className="text-xs">{quote.author} {quote.page && `• Pág. ${quote.page}`}</p>
        </div>
      </div>

      {/* Botões de Ação (Aparecem no Hover) */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
           onClick={handleCopy}
           className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-current transition-colors"
           title="Copiar texto"
         >
           {copied ? <i className="fas fa-check text-green-400"></i> : <i className="far fa-copy"></i>}
         </button>
         <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-current transition-colors">
           <i className="fas fa-share-alt"></i>
         </button>
      </div>
    </div>
  );
}