"use client";

import { useState } from 'react';
import Link from 'next/link';

// Dados dos módulos (Correspondendo aos links reais e ao PDF)
const allModules = [
  // Education
  { id: 'write', vertical: 'Education', slug: 'facillit-write', icon: 'fa-pencil-alt', title: 'Facillit Write', desc: 'Correção de redação com IA e tutores humanos.', status: 'active' },
  { id: 'games', vertical: 'Education', slug: 'facillit-games', icon: 'fa-gamepad', title: 'Facillit Games', desc: 'Gamificação adaptativa para aprender jogando.', status: 'active' },
  { id: 'play', vertical: 'Education', slug: 'facillit-play', icon: 'fa-play-circle', title: 'Facillit Play', desc: 'Streaming de videoaulas e documentários.', status: 'active' },
  { id: 'test', vertical: 'Education', slug: 'facillit-test', icon: 'fa-file-alt', title: 'Facillit Test', desc: 'Simulados e provas personalizadas.', status: 'active' },
  { id: 'library', vertical: 'Education', slug: 'facillit-library', icon: 'fa-book-open', title: 'Facillit Library', desc: 'Acervo digital e portfólio do aluno.', status: 'active' },
  { id: 'create', vertical: 'Education', slug: 'facillit-create', icon: 'fa-lightbulb', title: 'Facillit Create', desc: 'Mapas mentais e ferramentas visuais.', status: 'active' },
  
  // Schools
  { id: 'edu', vertical: 'Schools', slug: 'facillit-edu', icon: 'fa-graduation-cap', title: 'Facillit Edu', desc: 'Gestão escolar completa e diário digital.', status: 'active' },
  { id: 'lab', vertical: 'Schools', slug: 'facillit-lab', icon: 'fa-flask', title: 'Facillit Lab', desc: 'Laboratório virtual com experimentos 3D.', status: 'active' },

  // Global (Produtividade)
  { id: 'day', vertical: 'Global', slug: 'facillit-day', icon: 'fa-calendar-check', title: 'Facillit Day', desc: 'Agenda inteligente integrada ao ecossistema.', status: 'active' },
  { id: 'task', vertical: 'Global', slug: 'facillit-task', icon: 'fa-tasks', title: 'Facillit Task', desc: 'Gestão de tarefas pessoais e projetos.', status: 'active' },
  { id: 'connect', vertical: 'Global', slug: 'facillit-connect', icon: 'fa-users', title: 'Facillit Connect', desc: 'Rede social para comunidades de estudo.', status: 'active' },
  { id: 'coach', vertical: 'Global', slug: 'facillit-coach-career', icon: 'fa-compass', title: 'Coach & Career', desc: 'Orientação vocacional e soft skills.', status: 'active' },
  { id: 'stories', vertical: 'Global', slug: 'facillit-coach-career', icon: 'fa-comments', title: 'Facillit Stories', desc: 'Onde leitores se encontram: conecte-se, crie listas e descubra histórias.', status: 'active' },
  
  // Business (Novos - Em Breve)
  { id: 'center', vertical: 'Business', slug: '#', icon: 'fa-chart-line', title: 'Facillit Center', desc: 'Gestão de startups e negócios.', status: 'coming_soon' },
  { id: 'people', vertical: 'Business', slug: '#', icon: 'fa-users-cog', title: 'Facillit People', desc: 'Gestão de RH e talentos.', status: 'coming_soon' },
  
];

const tabs = ['Todos', 'Education', 'Schools', 'Business', 'Global'];

export default function Modules() {
  const [activeTab, setActiveTab] = useState('Todos');

  const filteredModules = activeTab === 'Todos' 
    ? allModules 
    : allModules.filter(m => m.vertical === activeTab);

  return (
    <section id="modules" className="py-24 bg-white relative">
      {/* Decoração de Fundo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-purple/5 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-dark-text mb-6">
            Um Universo de Possibilidades
          </h2>
          <p className="text-lg text-gray-600">
            Nossa arquitetura modular permite que você escolha exatamente o que precisa. 
            Tudo integrado, tudo em um só lugar.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                ${activeTab === tab 
                  ? 'bg-brand-purple text-white border-brand-purple shadow-lg transform scale-105' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-purple hover:text-brand-purple hover:bg-brand-purple/5'}`}
            >
              {tab === 'Todos' ? 'Todos os Módulos' : `For ${tab}`}
            </button>
          ))}
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {filteredModules.map((module) => (
            <div key={module.id} className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full ${module.status === 'coming_soon' ? 'opacity-80' : ''}`}>
              
              {/* Badge Em Breve */}
              {module.status === 'coming_soon' && (
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">
                  EM BREVE
                </div>
              )}

              {/* Ícone */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-colors duration-300 
                ${module.status === 'coming_soon' ? 'bg-gray-100 text-gray-400' : 'bg-brand-purple/10 text-brand-purple group-hover:bg-brand-purple group-hover:text-white shadow-sm'}`}>
                <i className={`fas ${module.icon}`}></i>
              </div>

              {/* Conteúdo */}
              <h3 className="text-xl font-bold text-dark-text mb-3 group-hover:text-brand-purple transition-colors">
                {module.title}
              </h3>
              <p className="text-gray-500 mb-6 flex-grow leading-relaxed">
                {module.desc}
              </p>

              {/* Link / Ação */}
              {module.status === 'active' ? (
                <Link href={module.slug} className="inline-flex items-center font-bold text-brand-purple hover:text-brand-green transition-colors mt-auto">
                  Saiba mais <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                </Link>
              ) : (
                <span className="text-sm text-gray-400 font-medium mt-auto cursor-not-allowed">
                  Aguarde o lançamento
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action da Secção */}
        <div className="mt-20 text-center bg-gray-50 rounded-3xl p-12 border border-gray-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
             <h3 className="text-2xl font-bold text-dark-text mb-4">Não encontrou o que procurava?</h3>
             <p className="text-gray-600 mb-8">Estamos constantemente expandindo nosso ecossistema. Confira nosso roteiro de atualizações.</p>
             <Link href="/register" className="inline-block px-8 py-3 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-purple transition-colors shadow-lg">
               Criar Conta Gratuita
             </Link>
           </div>
        </div>

      </div>
    </section>
  );
}