"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const updates = [
  {
    version: "v2.1.0",
    date: "26 Nov, 2025",
    title: "Novo Facillit Write com IA Generativa",
    desc: "Lançamos o novo motor de correção de redação. Agora a IA oferece sugestões de reescrita em tempo real e análise de competências do ENEM mais profunda.",
    tags: ["Feature", "Write"],
    color: "bg-brand-purple text-white"
  },
  {
    version: "v2.0.5",
    date: "15 Nov, 2025",
    title: "Melhorias no Dashboard de Escolas",
    desc: "Gestores agora podem visualizar gráficos de desempenho por turma e exportar relatórios em PDF com um clique.",
    tags: ["Melhoria", "Edu"],
    color: "bg-brand-green text-white"
  },
  {
    version: "v2.0.0",
    date: "01 Nov, 2025",
    title: "Lançamento do Facillit Hub 2.0",
    desc: "Nova identidade visual, reestruturação das verticais (Students, Schools, Enterprise) e modo escuro nativo.",
    tags: ["Major", "Plataforma"],
    color: "bg-brand-dark text-white"
  },
];

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20">
        
        <div className="container mx-auto px-6 text-center mb-16">
            <span className="text-brand-purple font-bold tracking-wider uppercase text-xs mb-2 block">Changelog</span>
            <h1 className="text-4xl font-black text-gray-900 mb-4">O que há de novo?</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
                Acompanhe a evolução do Facillit Hub. Estamos sempre a lançar novas funcionalidades e melhorias.
            </p>
        </div>

        <div className="container mx-auto px-6 max-w-3xl">
            <div className="relative border-l-2 border-gray-200 pl-8 ml-4 md:ml-0 space-y-12">
                
                {updates.map((update, idx) => (
                    <div key={idx} className="relative">
                        {/* Bolinha da Timeline */}
                        <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-brand-purple"></div>
                        
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${update.color}`}>
                                        {update.version}
                                    </span>
                                    <span className="text-gray-400 text-sm font-medium">{update.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    {update.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{update.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {update.desc}
                            </p>
                        </div>
                    </div>
                ))}

            </div>
            
            <div className="text-center mt-12">
                <button className="px-6 py-2 border border-gray-300 rounded-full text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-colors text-sm font-bold">
                    Carregar mais antigos...
                </button>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}