"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Dados expandidos para parecer mais completo
const faqCategories = [
  { id: "geral", label: "Geral", icon: "fa-compass" },
  { id: "alunos", label: "Para Alunos", icon: "fa-graduation-cap" },
  { id: "escolas", label: "Para Escolas", icon: "fa-school" },
  { id: "financeiro", label: "Planos & Financeiro", icon: "fa-credit-card" },
  { id: "tecnico", label: "Suporte Técnico", icon: "fa-laptop-code" },
];

const faqData = {
  geral: [
    { q: "O que é o Facillit Hub?", a: "O Facillit Hub é um ecossistema digital integrado que une educação, produtividade e gestão numa única plataforma, servindo estudantes, escolas e empresas." },
    { q: "Como crio uma conta?", a: "Clique em 'Criar Conta' no canto superior direito. Pode criar uma conta pessoal gratuita ou ativar um código institucional fornecido pela sua escola." },
    { q: "A plataforma é segura?", a: "Sim. Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD para proteger todos os seus dados e produções." },
  ],
  alunos: [
    { q: "Como funciona a correção de redação?", a: "No Facillit Write, você escreve ou cola o seu texto. A nossa IA analisa a estrutura, gramática e competências em segundos, fornecendo feedback detalhado e sugestões de reescrita." },
    { q: "Posso usar o Facillit Day no telemóvel?", a: "Sim! O módulo de agenda e hábitos é totalmente responsivo e sincroniza em tempo real entre todos os seus dispositivos." },
  ],
  escolas: [
    { q: "Como migrar os dados da minha escola?", a: "A nossa equipa de 'Onboarding Institucional' auxilia na importação de turmas e alunos via planilhas ou integração API com o seu sistema de gestão atual." },
    { q: "Os pais têm acesso?", a: "Sim, o perfil 'Responsável' permite acompanhar frequência, notas e o desenvolvimento pedagógico do aluno através do Facillit Connect." },
  ],
  financeiro: [
    { q: "Quais são as formas de pagamento?", a: "Aceitamos Cartão de Crédito, PIX e Boleto Bancário para planos mensais e anuais." },
    { q: "Como cancelo a minha assinatura?", a: "Pode cancelar a qualquer momento nas configurações da sua conta, na aba 'Assinatura'. O acesso mantém-se até ao fim do ciclo pago." },
  ],
  tecnico: [
    { q: "Esqueci a minha senha, e agora?", a: "Na tela de login, clique em 'Esqueceu-se?'. Enviaremos um link seguro para o seu e-mail registado para redefinir a credencial." },
    { q: "Requisitos de sistema?", a: "O Facillit Hub roda diretamente no navegador. Recomendamos versões recentes do Chrome, Edge, Firefox ou Safari para melhor performance." },
  ]
};

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState("geral");
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Primeiro item aberto por padrão

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        
        {/* Hero Section: Fundo Arredondado e Gradiente */}
        <div className="container mx-auto px-6 mb-12">
            <div className="bg-brand-gradient rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
                {/* Efeitos de Fundo */}
                <div className="absolute top-0 left-0 w-full h-full bg-brand-gradient opacity-20"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-green rounded-full blur-3xl opacity-10"></div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="text-brand-green font-bold tracking-wider uppercase text-xs mb-4 block">Central de Ajuda</span>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-8">
                        Como podemos facilitar o seu dia?
                    </h1>
                    
                    {/* Barra de Pesquisa */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-brand-gradient rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-white rounded-full flex items-center p-2 shadow-lg">
                            <i className="fas fa-search text-gray-400 ml-4 text-lg"></i>
                            <input 
                                type="text" 
                                placeholder="Pesquise por: login, redação, planos..." 
                                className="w-full p-3 pl-4 rounded-full text-gray-800 focus:outline-none placeholder:text-gray-400"
                            />
                            <button className="bg-brand-dark text-white px-6 py-2 rounded-full font-bold hover:bg-brand-purple transition-colors">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-6 max-w-5xl">
            
            {/* Navegação de Categorias (Pills) */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {faqCategories.map((cat) => (
                    <button 
                        key={cat.id}
                        onClick={() => { setActiveTab(cat.id); setOpenIndex(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${activeTab === cat.id ? 'bg-brand-purple text-white border-brand-purple shadow-lg scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-purple hover:text-brand-purple'}`}
                    >
                        <i className={`fas ${cat.icon}`}></i>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Accordion Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 md:p-8 min-h-[400px]">
                {/* @ts-ignore */}
                {faqData[activeTab].map((item: any, idx: number) => (
                    <div key={idx} className="border-b border-gray-50 last:border-0">
                        <button 
                            onClick={() => toggleAccordion(idx)}
                            className="w-full p-6 text-left flex justify-between items-start gap-4 group focus:outline-none"
                        >
                            <span className={`font-bold text-lg transition-colors ${openIndex === idx ? 'text-brand-purple' : 'text-gray-800 group-hover:text-brand-purple'}`}>
                                {item.q}
                            </span>
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${openIndex === idx ? 'bg-brand-purple text-white rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-brand-purple/10 group-hover:text-brand-purple'}`}>
                                <i className="fas fa-chevron-down text-xs"></i>
                            </span>
                        </button>
                        <div 
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="px-6 pb-8 text-gray-500 leading-relaxed text-base">
                                {item.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer da Secção */}
            <div className="mt-16 text-center">
                <p className="text-gray-500 mb-4">Ainda precisa de ajuda?</p>
                <div className="flex justify-center gap-4">
                    <a href="/recursos/contato" className="px-8 py-3 bg-white border-2 border-brand-purple text-brand-purple font-bold rounded-xl hover:bg-brand-purple hover:text-white transition-all">
                        Abrir Chamado
                    </a>
                    <a href="#" className="px-8 py-3 bg-brand-green text-brand-dark font-bold rounded-xl hover:brightness-110 transition-all shadow-lg">
                        Chat em Tempo Real
                    </a>
                </div>
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}