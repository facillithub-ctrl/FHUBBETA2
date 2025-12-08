import React from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Rocket, ArrowRight, LogOut } from 'lucide-react';

export default function HubSelectionPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorativo (Claro) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-violet-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Escolha seu Hub
          </h1>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Navegue entre os diferentes ecossistemas da Facillit.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Card 1: Education */}
          <Link href="/education" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-[20px] opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            <div className="relative h-full bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 shadow-sm group-hover:shadow-xl">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={28} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Education</h2>
              <p className="text-neutral-500 text-sm mb-8 flex-1 leading-relaxed">
                Área do estudante. Redação, simulados, jogos e acompanhamento de desempenho escolar.
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Acessar <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 2: Global */}
          <Link href="/global" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-violet-500 to-fuchsia-600 rounded-[20px] opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            <div className="relative h-full bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 shadow-sm group-hover:shadow-xl">
              <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe size={28} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Global Hub</h2>
              <p className="text-neutral-500 text-sm mb-8 flex-1 leading-relaxed">
                Comunidade global. Stories, feed social, networking e conexões com o mundo.
              </p>
              <div className="flex items-center text-violet-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Acessar <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 3: Startups (Bloqueado/Future) */}
          <div className="relative opacity-60 grayscale hover:grayscale-0 transition-all duration-500 cursor-not-allowed">
            <div className="relative h-full bg-neutral-100 border border-neutral-200 rounded-2xl p-8 flex flex-col items-start">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Rocket size={28} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-400 mb-2">Startups</h2>
              <p className="text-neutral-400 text-sm mb-8 flex-1 leading-relaxed">
                Hub de inovação e empreendedorismo. Ferramentas para construir o futuro.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-200 text-neutral-500 text-xs font-medium">
                Em breve
              </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-16 flex items-center gap-4">
           <Link href="/logout" className="flex items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50">
             <LogOut size={16} /> Sair da conta
           </Link>
        </div>
      </div>
    </div>
  );
}