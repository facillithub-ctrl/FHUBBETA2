"use client";

import { Search, MoreHorizontal } from 'lucide-react';

export default function StoriesSidebar() {
  return (
    <div className="flex flex-col gap-6 pl-6 pt-2 h-full">
      
      {/* Busca */}
      <div className="sticky top-2 bg-white z-10 pb-2">
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <Search size={18} />
             </div>
             <input 
               type="text" 
               placeholder="Buscar no Facillit" 
               className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all outline-none font-inter"
             />
          </div>
      </div>

      {/* Trending Books Card */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
         <h3 className="font-black text-lg text-gray-900 mb-4 px-1">O que estão lendo</h3>
         
         <div className="space-y-5">
            {[ 
                { title: "Torto Arado", author: "Itamar V.", posts: "12.5K", tag: "Literatura BR" },
                { title: "Quarta Asa", author: "Rebecca Y.", posts: "8.2K", tag: "Fantasia" },
                { title: "Hábitos Atômicos", author: "James Clear", posts: "5K", tag: "Produtividade" }
            ].map((book, i) => (
                <div key={i} className="flex justify-between items-start group cursor-pointer">
                    <div className="flex gap-3">
                        <div className="text-gray-400 font-bold text-sm w-4">{i + 1}</div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{book.tag}</span>
                            </div>
                            <p className="font-bold text-sm text-gray-900 leading-tight group-hover:underline">{book.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{book.posts} posts</p>
                        </div>
                    </div>
                    <button className="text-gray-300 hover:text-brand-purple hover:bg-purple-50 rounded-full p-1 transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            ))}
         </div>
         <button className="w-full text-left text-brand-purple text-sm mt-4 px-1 hover:underline">Mostrar mais</button>
      </div>

      {/* Comunidades Sugeridas */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
         <h3 className="font-black text-lg text-gray-900 mb-4 px-1">Clubes de Leitura</h3>
         <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">SF</div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">Sci-Fi Brasil</p>
                    <p className="text-xs text-gray-500 truncate">@scifibr • 45k membros</p>
                </div>
                <button className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity">Entrar</button>
            </div>
         </div>
      </div>

      <div className="text-[11px] text-gray-400 px-2 leading-relaxed">
         Termos de Serviço Política de Privacidade Política de Cookies Acessibilidade Informações de anúncios © 2025 Facillit Hub
      </div>
    </div>
  );
}