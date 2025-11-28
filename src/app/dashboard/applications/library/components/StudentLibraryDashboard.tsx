// src/app/dashboard/applications/library/components/StudentLibraryDashboard.tsx
'use client'

import Link from 'next/link';

export default function StudentLibraryDashboard({ user }: { user: any }) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-royal-blue to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Olá, {user.user_metadata?.full_name || 'Estudante'}! 👋</h1>
          <p className="opacity-90 text-lg mb-6">Sua biblioteca pessoal está pronta. Você tem 3 redações pendentes para arquivar e 1 livro em andamento.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/applications/library/discover" className="bg-white text-royal-blue px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Explorar Acervo
            </Link>
            <Link href="/dashboard/applications/library?folder=root" className="bg-blue-600/50 backdrop-blur-sm border border-white/20 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-colors">
              Meu Drive
            </Link>
          </div>
        </div>
        {/* Decorative Element */}
        <i className="fas fa-book-reader absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12"></i>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction href="/dashboard/applications/library/portfolio" icon="fa-briefcase" title="Meu Portfólio" desc="Seus projetos públicos" color="text-purple-600 bg-purple-50" />
        <QuickAction href="/dashboard/applications/library/notes" icon="fa-sticky-note" title="Anotações" desc="Resumos e ideias" color="text-yellow-600 bg-yellow-50" />
        <QuickAction href="/dashboard/applications/library/favorites" icon="fa-star" title="Favoritos" desc="Itens salvos" color="text-pink-600 bg-pink-50" />
        <QuickAction href="/dashboard/applications/write" icon="fa-pen-fancy" title="Escrever" desc="Ir para o Write" color="text-green-600 bg-green-50" />
      </div>

      {/* Continue Reading Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-history text-gray-400"></i> Continuar Estudando
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card de Progresso */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-16 h-20 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-gray-300 animate-pulse"></div> {/* Placeholder da capa */}
            </div>
            <div className="flex-1 py-1">
              <h4 className="font-bold text-gray-900 group-hover:text-royal-blue transition-colors line-clamp-1">Dom Casmurro</h4>
              <p className="text-xs text-gray-500 mb-3">Machado de Assis</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-[10px] text-gray-400">45% concluído</p>
            </div>
          </div>
          
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-16 h-20 bg-red-50 rounded-lg flex-shrink-0 flex items-center justify-center text-red-500 text-2xl">
               <i className="fas fa-file-pdf"></i>
            </div>
            <div className="flex-1 py-1">
              <h4 className="font-bold text-gray-900 group-hover:text-royal-blue transition-colors line-clamp-1">Apostila Biologia Celular</h4>
              <p className="text-xs text-gray-500 mb-3">Material de Aula</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div className="bg-royal-blue h-1.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-[10px] text-gray-400">Pág 24 de 30</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended for You */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sugerido para Você</h2>
          <span className="text-xs text-gray-500">Baseado no Facillit Test</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Cards simples de sugestão */}
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
               <div className="h-32 bg-gray-100 relative">
                 {/* Imagem Placeholder */}
                 <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <i className="fas fa-image text-3xl"></i>
                 </div>
               </div>
               <div className="p-4">
                 <div className="text-[10px] font-bold text-royal-blue uppercase tracking-wide mb-1">História</div>
                 <h3 className="font-bold text-gray-900 mb-1 truncate">A Revolução Francesa</h3>
                 <p className="text-xs text-gray-500 line-clamp-2">Entenda os principais eventos que marcaram o fim do absolutismo.</p>
               </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}

const QuickAction = ({ href, icon, title, desc, color }: any) => (
  <Link href={href} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className="font-bold text-gray-900 text-sm">{title}</span>
    <span className="text-xs text-gray-500">{desc}</span>
  </Link>
);