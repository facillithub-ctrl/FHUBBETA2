"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const vagas = [
  { title: "Desenvolvedor Full Stack Senior", area: "Engenharia", tipo: "Remoto", link: "#" },
  { title: "Designer de Produto (UX/UI)", area: "Design", tipo: "Híbrido - SP", link: "#" },
  { title: "Analista de Customer Success", area: "Sucesso do Cliente", tipo: "Remoto", link: "#" },
  { title: "Executivo de Vendas Educacionais", area: "Vendas", tipo: "Híbrido - SP", link: "#" },
];

const beneficios = [
  { icon: "fa-laptop-house", title: "Trabalho Flexível", desc: "Remoto ou híbrido, você escolhe onde produz melhor." },
  { icon: "fa-heartbeat", title: "Saúde Integral", desc: "Plano de saúde e odontológico de ponta para você e família." },
  { icon: "fa-graduation-cap", title: "Educação Contínua", desc: "Orçamento anual para cursos, livros e eventos." },
  { icon: "fa-rocket", title: "Crescimento Acelerado", desc: "Plano de carreira claro e oportunidades de liderança." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20">
        {/* Hero Section */}
        <div className="container mx-auto px-6 text-center mb-20">
          <span className="text-brand-purple font-bold tracking-wider uppercase text-xs mb-2 block">Carreiras</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Construa o futuro da <span className="text-transparent bg-clip-text bg-brand-gradient">Educação</span>.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Junte-se a uma equipa apaixonada por tecnologia e impacto social. Estamos a transformar a forma como escolas, alunos e empresas aprendem e produzem.
          </p>
          <a href="#vagas" className="inline-block px-8 py-4 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-purple transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Ver Vagas Abertas
          </a>
        </div>

        {/* Cultura & Benefícios */}
        <div className="bg-white py-20 border-y border-gray-100 mb-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Por que o Facillit Hub?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {beneficios.map((ben, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all text-center border border-transparent hover:border-gray-100 group">
                            <div className="w-14 h-14 mx-auto bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-brand-purple group-hover:text-white transition-colors">
                                <i className={`fas ${ben.icon}`}></i>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-gray-800">{ben.title}</h3>
                            <p className="text-sm text-gray-500">{ben.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Lista de Vagas */}
        <div id="vagas" className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Vagas Disponíveis</h2>
                <p className="text-gray-600">Encontre o seu lugar na nossa missão.</p>
            </div>

            <div className="space-y-4">
                {vagas.map((vaga, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:shadow-md transition-all group">
                        <div className="mb-4 md:mb-0 text-center md:text-left">
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-brand-purple transition-colors">{vaga.title}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                <span><i className="fas fa-briefcase mr-1"></i> {vaga.area}</span>
                                <span><i className="fas fa-map-marker-alt mr-1"></i> {vaga.tipo}</span>
                            </div>
                        </div>
                        <Link href={vaga.link} className="px-6 py-2 border border-brand-purple text-brand-purple font-bold rounded-full hover:bg-brand-purple hover:text-white transition-all">
                            Candidatar-se
                        </Link>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center p-8 bg-brand-gradient rounded-3xl text-white">
                <h3 className="text-xl font-bold mb-2">Não encontrou a sua vaga?</h3>
                <p className="mb-6 opacity-90">Estamos sempre à procura de talentos. Envie o seu CV para o nosso banco de talentos.</p>
                <a href="mailto:talentos@facillithub.com" className="px-6 py-3 bg-white text-brand-purple font-bold rounded-full hover:shadow-lg transition-all">
                    Enviar CV Espontâneo
                </a>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}