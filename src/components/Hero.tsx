"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center pt-36 pb-20 lg:pt-48">
      
      <div className="container mx-auto px-6 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/5 border border-brand-purple/10 text-brand-purple text-sm font-bold mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
          </span>
          <span>Plataforma de Gestão Educacional 2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-dark-text mb-8 leading-[1.1] animate-fade-in-up">
          Potencialize <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
            Cada Conexão.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
          O Facillit Hub centraliza a jornada do estudante, a gestão escolar e a produtividade corporativa num ecossistema único e inteligente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-purple text-white font-bold text-lg shadow-xl hover:shadow-brand-purple/30 hover:-translate-y-1 transition-all duration-300"
          >
            Começar Gratuitamente
          </Link>
          {/* Link ancora corrigido */}
          <Link 
            href="#modules" 
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-gray-300 bg-white text-gray-700 font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            Ver Módulos
          </Link>
        </div>

        {/* ... (Restante do código visual do dashboard mantém-se igual ao anterior) ... */}
        <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up animation-delay-500">
           <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/20 to-brand-green/20 blur-3xl -z-10 rounded-[3rem] transform translate-y-10 scale-90"></div>
           <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl transform rotate-x-6 perspective-1000 group hover:rotate-0 transition-all duration-700 ease-out">
              <div className="h-10 bg-gray-50 border-b border-gray-100 rounded-t-xl flex items-center px-4 gap-2">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
                  <div className="ml-4 h-5 w-64 bg-gray-200/50 rounded-md"></div>
              </div>
              <div className="grid grid-cols-12 gap-6 p-6 h-[350px] md:h-[450px] overflow-hidden bg-white rounded-b-xl">
                 <div className="col-span-3 bg-gray-50 border border-gray-100 rounded-xl h-full p-4 flex flex-col gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-purple"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="mt-4 space-y-2"><div className="h-8 w-full bg-white border border-gray-100 rounded shadow-sm"></div><div className="h-8 w-full bg-transparent rounded"></div><div className="h-8 w-full bg-transparent rounded"></div></div>
                 </div>
                 <div className="col-span-9 grid grid-rows-3 gap-6">
                    <div className="row-span-1 grid grid-cols-3 gap-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 relative overflow-hidden"><div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div></div><div className="h-4 w-1/2 bg-gray-100 rounded mb-2"></div><div className="h-8 w-3/4 bg-brand-purple/10 rounded"></div></div>
                        <div className="bg-white border border-gray-100 shadow-sm rounded-xl"></div><div className="bg-white border border-gray-100 shadow-sm rounded-xl"></div>
                    </div>
                    <div className="row-span-2 bg-white border border-gray-100 shadow-sm rounded-xl p-6 relative">
                        <div className="h-4 w-1/4 bg-gray-100 rounded mb-6"></div>
                        <div className="absolute bottom-6 left-6 right-6 h-2/3 flex items-end justify-between gap-4">{[30, 50, 45, 80, 60, 75, 90, 65].map((h, i) => (<div key={i} style={{ height: `${h}%` }} className={`w-full rounded-t-md ${i === 6 ? 'bg-brand-green' : 'bg-gray-100'}`}></div>))}</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}