import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Globe, 
  Rocket, 
  ArrowRight, 
  LogOut, 
  LayoutGrid, 
  Users, 
  Newspaper, 
  MessageCircle,
  PenTool,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

export default function HubSelectionPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-inter">
      
      {/* Background Decorativo com as cores da marca (Animado) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 max-w-7xl w-full flex flex-col items-center">
        
        {/* Header Compacto */}
        <div className="text-center mb-12 animate-fade-in-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
            <LayoutGrid size={14} className="text-brand-purple" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">Ecossistema Facillit</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Selecione seu destino
          </h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Navegue entre aprendizado focado e conexão global. Onde você quer evoluir hoje?
          </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full px-2 md:px-0">
          
          {/* --- 1. GLOBAL HUB (DESTAQUE / HERO) --- 
              Ocupa 7 colunas no desktop (mais da metade) para dar ênfase
          */}
          <Link href="/global" className="col-span-1 lg:col-span-7 group relative outline-none flex">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-brand-purple to-indigo-500 rounded-[32px] opacity-75 group-hover:opacity-100 blur transition-opacity duration-500" />
            
            <div className="relative w-full bg-white dark:bg-gray-900 rounded-[30px] p-8 md:p-10 flex flex-col md:flex-row gap-8 overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1">
              
              {/* Background sutil interno */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100 to-transparent opacity-50 rounded-bl-full pointer-events-none" />

              <div className="flex-1 flex flex-col justify-between z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Globe size={24} />
                    </div>
                    <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider rounded-full border border-pink-100">
                      Destaque
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-brand-purple transition-all">
                    Global Hub
                  </h2>
                  <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6">
                    O coração da comunidade. Explore histórias inspiradoras, conecte-se com estudantes de todo o mundo e fique por dentro das tendências.
                  </p>

                  {/* Feature List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Newspaper size={16} className="text-pink-500" /> Feed de Notícias & Stories
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-pink-500" /> Networking Global
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageCircle size={16} className="text-pink-500" /> Comunidades e Grupos
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-pink-600 font-bold text-sm md:text-base group-hover:gap-2 transition-all">
                  Acessar Comunidade Global <ArrowRight size={20} className="ml-2" />
                </div>
              </div>

              {/* Imagem Decorativa / Ilustração do Global */}
              <div className="hidden md:flex w-1/3 items-center justify-center relative">
                 <div className="relative w-full aspect-square">
                    {/* Círculos animados representando conexões */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-brand-purple/20 rounded-full animate-spin-slow opacity-60 blur-xl"></div>
                    <div className="absolute inset-4 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 z-10">
                        <Globe size={64} className="text-pink-500 opacity-80" />
                    </div>
                    {/* Floating Badges */}
                    <div className="absolute -top-2 -right-2 bg-white p-2 rounded-lg shadow-md z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                        <Users size={16} className="text-blue-500" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-lg shadow-md z-20 animate-bounce" style={{ animationDuration: '4s' }}>
                        <MessageCircle size={16} className="text-green-500" />
                    </div>
                 </div>
              </div>
            </div>
          </Link>

          {/* Coluna da Direita (Empilhados) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">

            {/* --- 2. EDUCATION HUB --- */}
            <Link href="/education" className="group relative outline-none flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-[32px] opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              
              <div className="relative h-full bg-white rounded-[30px] p-8 flex flex-col border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <BookOpen size={24} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Education Hub
                </h2>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                  Ferramentas focadas no seu desempenho acadêmico e aprendizado contínuo.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <PenTool size={14} className="text-blue-500" /> Redação IA
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <GraduationCap size={14} className="text-blue-500" /> Simulados
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg col-span-2">
                        <BrainCircuit size={14} className="text-blue-500" /> Planos de Estudo
                    </span>
                </div>

                <div className="mt-auto flex items-center text-blue-600 font-bold text-sm group-hover:gap-2 transition-all">
                  Acessar Área de Estudo <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </Link>

            {/* --- 3. STARTUPS (DISABLED) --- */}
            <div className="relative group cursor-not-allowed opacity-70 hover:opacity-100 transition-opacity">
               <div className="relative bg-gray-50 border border-gray-200 border-dashed rounded-[30px] p-6 flex items-center gap-6">
                  <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Rocket size={24} />
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-gray-500">Startups</h2>
                          <span className="px-1.5 py-0.5 bg-gray-200 text-[10px] font-bold text-gray-500 rounded uppercase">Em Breve</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Inovação e empreendedorismo.
                      </p>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 text-center">
           <Link 
            href="/logout" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all text-sm font-medium px-6 py-3 rounded-full hover:bg-red-50"
           >
             <LogOut size={16} /> 
             Sair da conta
           </Link>
        </div>
      </div>
    </div>
  );
}