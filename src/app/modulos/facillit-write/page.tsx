"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

// Dados
const features = [
  {
    title: "Correção IA em Tempo Real",
    desc: "Análise instantânea baseada nas 5 competências oficiais do ENEM e vestibulares.",
    icon: "fa-bolt",
    color: "text-yellow-500",
    bg: "bg-yellow-50"
  },
  {
    title: "Detecção de Plágio",
    desc: "Verificação profunda na web para garantir a originalidade e autenticidade do texto.",
    icon: "fa-search",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    title: "Sugestões de Reescrita",
    desc: "A IA não apenas aponta o erro, mas sugere formas mais coesas e elegantes de escrever.",
    icon: "fa-pen-fancy",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10"
  },
  {
    title: "Histórico de Evolução",
    desc: "Gráficos que mostram a progressão da nota do aluno ao longo do tempo.",
    icon: "fa-chart-line",
    color: "text-brand-green",
    bg: "bg-brand-green/10"
  }
];

const updates = [
  { version: "2.1", date: "Out 2025", desc: "Novo motor de análise sintática para orações subordinadas." },
  { version: "2.0", date: "Set 2025", desc: "Integração com temas de redação dinâmicos via API." },
  { version: "1.8", date: "Ago 2025", desc: "Modo escuro nativo no editor de texto." },
];

export default function FacillitWritePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow">
        
        {/* --- HERO SECTION --- */}
        {/* Padding top ajustado para o conteúdo não ficar atrás do Header */}
        <div className="relative bg-brand-gradient text-white overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl pb-24 pt-40 md:pt-48">
            
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-brand-purple/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    
                    {/* --- ÁREA DOS LOGOS GIGANTES (SEM FUNDO) --- */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 animate-fade-in-down w-full">
                        
                        {/* Selo Education - Grande */}
                        <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 hover:scale-105 transition-transform duration-500">
                            <Image 
                                src="/assets/images/for/education.png" 
                                alt="For Education" 
                                fill 
                                className="object-contain brightness-0 invert drop-shadow-2xl" 
                                priority
                            />
                        </div>

                        {/* Divisor visual vertical (apenas desktop) */}
                        <div className="hidden md:block w-1 h-32 bg-white/20 rounded-full"></div>

                        {/* Logo Write - Grande */}
                        <div className="relative w-64 h-32 md:w-96 md:h-48 shrink-0 hover:scale-105 transition-transform duration-500">
                            <Image 
                                src="/assets/images/marcas/Write.png" 
                                alt="Facillit Write" 
                                fill 
                                className="object-contain brightness-0 invert drop-shadow-2xl" 
                                priority
                            />
                        </div>
                    </div>

                    {/* Título e Subtítulo */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 tracking-tight drop-shadow-lg">
                        Domine a escrita <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-200">com IA Avançada.</span>
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md">
                        Correção instantânea, análise de competências e feedback pedagógico personalizado para alunos e escolas que buscam a nota 1000.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap justify-center gap-6 mb-20">
                        <Link href="/dashboard/applications/write" className="px-10 py-5 bg-white text-brand-purple font-black rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-brand-green hover:text-brand-dark hover:-translate-y-1 transition-all text-lg md:text-xl">
                            Começar Agora
                        </Link>
                        <a href="#funcionalidades" className="px-10 py-5 bg-white/10 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/20 hover:border-white transition-all backdrop-blur-md text-lg md:text-xl">
                            Ver Recursos
                        </a>
                    </div>

                    {/* 3. Imagem do Dashboard (Hero Shot) */}
                    <div className="relative w-full max-w-7xl mx-auto transform translate-y-12">
                        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-4 border-white/20 group">
                            <Image 
                                src="/assets/modulespervw/write/dashboard.jpeg" 
                                alt="Interface Facillit Write" 
                                fill 
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            {/* Overlay de Brilho */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                        </div>
                        
                        {/* Badges Flutuantes */}
                        <div className="absolute -top-8 -right-8 bg-white text-brand-purple p-4 rounded-2xl shadow-2xl font-black text-lg rotate-6 animate-float hidden md:flex items-center gap-3 border border-gray-100">
                            <span className="flex items-center justify-center w-10 h-10 bg-brand-green rounded-full text-white shadow-lg">
                                <i className="fas fa-star"></i>
                            </span>
                            Nota 1000
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-brand-dark text-white p-4 rounded-2xl shadow-2xl font-black text-lg -rotate-3 animate-float-delayed hidden md:flex items-center gap-3 border border-white/20">
                            <span className="flex items-center justify-center w-10 h-10 bg-brand-purple rounded-full text-white shadow-lg">
                                <i className="fas fa-robot"></i>
                            </span>
                            IA em Tempo Real
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Espaçamento extra para compensar a imagem que sai do Hero */}
        <div className="h-24 md:h-48"></div>

        {/* --- ESTATÍSTICAS --- */}
        <div className="container mx-auto px-6 mb-24">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-12 border border-gray-100 text-center relative z-20">
                <div>
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">+2M</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Redações Corrigidas</p>
                </div>
                <div className="md:border-x-2 border-gray-100">
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">98%</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Precisão na Análise</p>
                </div>
                <div>
                    <h3 className="text-5xl md:text-6xl font-black text-brand-purple mb-3">&lt; 30s</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Tempo de Correção</p>
                </div>
            </div>
        </div>

        {/* --- FUNCIONALIDADES --- */}
        <div id="funcionalidades" className="container mx-auto px-6 py-16">
            <div className="text-center mb-20">
                <span className="text-brand-purple font-bold text-sm uppercase tracking-widest border border-brand-purple/20 px-4 py-1 rounded-full">Tecnologia de Ponta</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-6">Recursos que transformam.</h2>
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

        {/* --- INTEGRAÇÃO EDU --- */}
        <div className="bg-white py-32 my-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-2/3 h-full bg-brand-purple/5 -skew-x-12 transform origin-top-right z-0"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-6 bg-gradient-to-r from-brand-purple to-brand-green opacity-20 rounded-[3rem] blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
                            <Image 
                                src="/assets/modulespervw/write/correção.jpeg" 
                                alt="Detalhe da Correção" 
                                width={800} 
                                height={600} 
                                className="relative rounded-[2rem] shadow-2xl border-8 border-white bg-white transform group-hover:rotate-1 transition-transform duration-500"
                            />
                        </div>
                    </div>
                    <div className="lg:w-1/2 space-y-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-sm font-black uppercase tracking-wide border border-brand-green/20">
                            <i className="fas fa-link"></i> Integração Nativa
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            Poder para Escolas com o <br/><span className="text-transparent bg-clip-text bg-brand-gradient">Facillit Edu</span>.
                        </h2>
                        <p className="text-gray-500 text-xl leading-relaxed font-medium">
                            Os dados gerados no Write não se perdem. Eles alimentam automaticamente os relatórios pedagógicos do Edu, permitindo identificar dificuldades e evoluções em tempo real.
                        </p>
                        <ul className="space-y-5">
                            {[
                                "Criação de temas personalizados para turmas.",
                                "Detecção automática de plágio entre alunos.",
                                "Exportação de notas direto para o boletim escolar."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-green/30 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 text-sm shadow-md">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <span className="text-gray-700 font-bold text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CHANGELOG --- */}
        <div className="container mx-auto px-6 py-24">
            <div className="bg-brand-dark rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-purple/30 via-brand-dark to-brand-dark"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3 sticky top-24">
                        <h3 className="text-4xl font-black mb-6">Evolução Contínua</h3>
                        <p className="text-white/60 mb-10 leading-relaxed text-lg">
                            O Facillit Write aprende e evolui. Confira as últimas melhorias implementadas no nosso motor de IA e na interface.
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