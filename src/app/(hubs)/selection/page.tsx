import React from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Rocket, ArrowRight } from 'lucide-react';

export default function HubSelectionPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-violet-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Bem-vindo ao Ecossistema
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Selecione o ambiente que deseja acessar. Você pode alternar entre eles a qualquer momento.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Card 1: Education */}
          <Link href="/education" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="relative h-full bg-neutral-800 border border-neutral-700 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">For Students</h2>
              <p className="text-neutral-400 text-sm mb-8 flex-1">
                Acesse suas ferramentas de estudo, redação, testes e acompanhe seu progresso acadêmico.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300">
                Acessar Education <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Global */}
          <Link href="/global" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500 to-fuchsia-700 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="relative h-full bg-neutral-800 border border-neutral-700 hover:border-violet-500/50 rounded-2xl p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 mb-6 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <Globe size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Global Hub</h2>
              <p className="text-neutral-400 text-sm mb-8 flex-1">
                Conecte-se com a comunidade, leia histórias (Stories), compartilhe experiências e explore o feed.
              </p>
              <div className="flex items-center text-violet-400 text-sm font-medium group-hover:text-violet-300">
                Acessar Global <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Startups (Future/Example) */}
          <div className="group relative opacity-75">
            <div className="relative h-full bg-neutral-800/50 border border-neutral-700 border-dashed rounded-2xl p-8 flex flex-col items-start">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
                <Rocket size={24} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-300 mb-2">Startups</h2>
              <p className="text-neutral-500 text-sm mb-8 flex-1">
                Ambiente focado em empreendedorismo, gestão de projetos e aceleração de negócios.
              </p>
              <div className="flex items-center text-emerald-600/50 text-sm font-medium px-3 py-1 bg-emerald-900/20 rounded-full border border-emerald-900/50">
                Em breve
              </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-16 text-neutral-500 text-sm">
          Logado como <span className="text-white font-medium">Usuário</span> • <Link href="/logout" className="hover:text-red-400 transition-colors">Sair</Link>
        </div>
      </div>
    </div>
  );
}