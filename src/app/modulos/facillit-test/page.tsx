"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

// Dados Específicos do Test
const features = [
  {
    title: "Banco de Questões IA",
    desc: "Gere provas inteiras em segundos com base em tópicos, habilidades da BNCC ou níveis de dificuldade.",
    icon: "fa-brain",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10"
  },
  {
    title: "Correção Automática",
    desc: "Digitalize gabaritos físicos ou aplique provas online com resultados instantâneos para o professor.",
    icon: "fa-magic",
    color: "text-brand-green",
    bg: "bg-brand-green/10"
  },
  {
    title: "Anti-Cola Inteligente",
    desc: "Bloqueio de navegador e monitorização de aba para garantir a integridade das avaliações online.",
    icon: "fa-shield-alt",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    title: "Análise de Desempenho",
    desc: "Relatórios detalhados por aluno e por turma, identificando lacunas de aprendizado (TRI).",
    icon: "fa-chart-pie",
    color: "text-orange-500",
    bg: "bg-orange-50"
  }
];

const updates = [
  { version: "3.2", date: "Out 2025", desc: "Novo gerador de provas impressas com diagramação automática." },
  { version: "3.1", date: "Set 2025", desc: "Suporte a questões discursivas com correção por palavra-chave IA." },
  { version: "3.0", date: "Ago 2025", desc: "Integração com Banco de Questões do ENEM 2024." },
];

export default function FacillitTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow">
        
        {/* --- HERO SECTION --- */}
        <div className="relative bg-brand-gradient text-white overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl pb-24 pt-40 md:pt-48">
            
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-brand-purple/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    
                    {/* --- ÁREA DOS LOGOS GIGANTES --- */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 animate-fade-in-down w-full">
                        
                        {/* Selo Education */}
                        <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 hover:scale-105 transition-transform duration-500">
                            <Image 
                                src="/assets/images/for/education.png" 
                                alt="For Education" 
                                fill 
                                className="object-contain brightness-0 invert drop-shadow-2xl" 
                                priority
                            />
                        </div>

                        <div className="hidden md:block w-1 h-32 bg-white/20 rounded-full"></div>

                        {/* Logo Test */}
                        <div className="relative w-64 h-32 md:w-96 md:h-48 shrink-0 hover:scale-105 transition-transform duration-500">
                            <Image 
                                src="/assets/images/marcas/test.png" 
                                alt="Facillit Test" 
                                fill 
                                className="object-contain brightness-0 invert drop-shadow-2xl" 
                                priority
                            />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 tracking-tight drop-shadow-lg">
                        Avaliações precisas, <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-200">insights poderosos.</span>
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md">
                        Crie, aplique e corrija provas em minutos. Transforme dados de avaliação em estratégias de ensino personalizadas.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap justify-center gap-6 mb-20">
                        <Link href="/dashboard/applications/test" className="px-10 py-5 bg-white text-brand-purple font-black rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-brand-green hover:text-brand-dark hover:-translate-y-1 transition-all text-lg md:text-xl">
                            Criar Prova
                        </Link>
                        <a href="#funcionalidades" className="px-10 py-5 bg-white/10 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/20 hover:border-white transition-all backdrop-blur-md text-lg md:text-xl">
                            Ver Recursos
                        </a>
                    </div>

                    {/* Hero Shot (Placeholder) */}
                    <div className="relative w-full max-w-7xl mx-auto transform translate-y-12">
                        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-4 border-white/20 group">
                            {/* Nota: Usando a imagem do dashboard do Write como placeholder até teres o do Test */}
                            <Image 
                                src="/assets/modulespervw/write/dashboard.jpeg" 
                                alt="Interface Facillit Test" 
                                fill 
                                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 grayscale hover:grayscale-0"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white/20 text-4xl font-black uppercase">Dashboard Facillit Test</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute -top-8 -right-8 bg-white text-brand-purple p-4 rounded-2xl shadow-2xl font-black text-lg rotate-6 animate-float hidden md:flex items-center gap-3 border border-gray-100">
                            <span className="flex items-center justify-center w-10 h-10 bg-brand-green rounded-full text-white shadow-lg">
                                <i className="fas fa-check"></i>
                            </span>
                            Correção Auto
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div className="h-24 md:h-48"></div>

        {/* --- ESTATÍSTICAS --- */}
        <div className="container mx-auto px-6 mb-24">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-12 border border-gray-100 text-center relative z-20">
                <div>
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">+500k</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Questões no Banco</p>
                </div>
                <div className="md:border-x-2 border-gray-100">
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">100%</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Alinhado à BNCC</p>
                </div>
                <div>
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">-80%</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Tempo de Correção</p>
                </div>
            </div>
        </div>

        {/* --- FUNCIONALIDADES --- */}
        <div id="funcionalidades" className="container mx-auto px-6 py-16">
            <div className="text-center mb-20">
                <span className="text-brand-purple font-bold text-sm uppercase tracking-widest border border-brand-purple/20 px-4 py-1 rounded-full">Avaliação 360º</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-6">Ferramentas de Exame</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feat, idx) => (
                    <div key={idx} className="group p-10 md:p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-lg hover:shadow-2xl hover:border-brand-purple/30 transition-all duration-500 hover:-translate-y-2">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 transition-colors ${feat.bg} ${feat.color} shadow-inner`}>
                            <i className={`fas ${feat.icon}`}></i>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-brand-purple transition-colors">{feat.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-lg font-medium">
                            {feat.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CHANGELOG --- */}
        <div className="container mx-auto px-6 py-24">
            <div className="bg-brand-dark rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-purple/30 via-brand-dark to-brand-dark"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3 sticky top-24">
                        <h3 className="text-4xl font-black mb-6">Novidades</h3>
                        <p className="text-white/60 mb-10 leading-relaxed text-lg">
                            O banco de dados do Facillit Test cresce diariamente. Acompanhe as melhorias na plataforma de exames.
                        </p>
                        <Link href="/recursos/atualizacoes" className="inline-flex items-center gap-3 text-brand-green font-bold hover:text-white transition-colors group text-lg">
                            Ver Histórico Completo <i className="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform"></i>
                        </Link>
                    </div>
                    <div className="lg:w-2/3 w-full grid gap-6">
                        {updates.map((up, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/10 transition-colors group hover:border-brand-green/30">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="px-3 py-1 bg-brand-green text-brand-dark text-xs font-black rounded-lg uppercase tracking-wider shadow-lg shadow-brand-green/20">v{up.version}</span>
                                        <span className="text-white/40 text-sm font-mono border-l border-white/10 pl-4">{up.date}</span>
                                    </div>
                                    <p className="font-bold text-white/90 text-lg group-hover:text-white transition-colors">{up.desc}</p>
                                </div>
                                <div className="mt-6 sm:mt-0 sm:ml-6 flex justify-end">
                                    <i className="fas fa-code-branch text-white/10 text-2xl group-hover:text-brand-green transition-colors transform group-hover:rotate-12"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}