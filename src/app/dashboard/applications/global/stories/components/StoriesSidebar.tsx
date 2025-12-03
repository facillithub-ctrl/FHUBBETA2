"use client";

import TrendingTerms from './TrendingTerms'; // Assumindo que você tem esse componente ou eu crio um simples abaixo

export default function StoriesSidebar() {
  return (
    <div className="flex flex-col gap-4 pl-4">
      {/* Busca */}
      <div className="relative group">
         <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"></i>
         <input 
           type="text" 
           placeholder="Buscar no Facillit" 
           className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white"
         />
      </div>

      {/* Box de Trending */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
         <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">O que está acontecendo</h3>
         {/* Se não tiver o componente TrendingTerms, use este placeholder: */}
         <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <div key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded transition cursor-pointer">
                  <div className="flex justify-between text-xs text-slate-500">
                     <span>Educação • Assunto do Momento</span>
                     <i className="fas fa-ellipsis-h"></i>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">ENEM 2024</p>
                  <p className="text-xs text-slate-500">10.5K posts</p>
               </div>
            ))}
         </div>
      </div>

      <div className="text-xs text-slate-400 px-2">
         © 2024 Facillit Hub Inc.
      </div>
    </div>
  );
}