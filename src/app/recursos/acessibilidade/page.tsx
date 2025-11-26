"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccessibilityPage() {
  // Estado apenas para demonstração visual dos botões na página
  const [activeMode, setActiveMode] = useState<string>('normal');

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20">
        
        {/* Hero Section */}
        <div className="container mx-auto px-6 mb-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-purple/10 text-brand-purple mb-6">
            <i className="fas fa-universal-access text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Acessibilidade para Todos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No Facillit Hub, acreditamos que a educação e a produtividade não devem ter barreiras. 
            Desenvolvemos a nossa plataforma seguindo as diretrizes WCAG 2.1 (Nível AA) para garantir 
            uma experiência inclusiva, autónoma e eficiente para todas as pessoas.
          </p>
        </div>

        <div className="container mx-auto px-6 max-w-6xl">
          
          {/* Secção 1: Modos de Visualização e Daltonismo */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
            <div className="p-8 md:p-10 bg-brand-dark text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <i className="fas fa-eye"></i> Adaptação Visual e Daltonismo
              </h2>
              <p className="text-gray-300 mb-0">
                O Facillit Hub possui um motor de temas nativo que permite ajustar a interface às suas necessidades visuais.
                Experimente as pré-visualizações abaixo:
              </p>
            </div>
            
            <div className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* Controles de Demonstração */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Selecione um modo de cor:</h3>
                  
                  <button 
                    onClick={() => setActiveMode('normal')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${activeMode === 'normal' ? 'border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-gray-700">Padrão (Cores da Marca)</span>
                    {activeMode === 'normal' && <i className="fas fa-check text-brand-purple"></i>}
                  </button>

                  <button 
                    onClick={() => setActiveMode('protanopia')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${activeMode === 'protanopia' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div>
                        <span className="font-bold text-gray-700 block">Protanopia</span>
                        <span className="text-xs text-gray-500">Ajuste para dificuldade com vermelho.</span>
                    </div>
                    {activeMode === 'protanopia' && <i className="fas fa-check text-blue-600"></i>}
                  </button>

                  <button 
                    onClick={() => setActiveMode('deuteranopia')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${activeMode === 'deuteranopia' ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-600' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div>
                        <span className="font-bold text-gray-700 block">Deuteranopia</span>
                        <span className="text-xs text-gray-500">Ajuste para dificuldade com verde.</span>
                    </div>
                    {activeMode === 'deuteranopia' && <i className="fas fa-check text-orange-600"></i>}
                  </button>

                  <button 
                    onClick={() => setActiveMode('contraste')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${activeMode === 'contraste' ? 'border-black bg-gray-900 text-white ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div>
                        <span className={`font-bold block ${activeMode === 'contraste' ? 'text-white' : 'text-gray-700'}`}>Alto Contraste</span>
                        <span className={`text-xs ${activeMode === 'contraste' ? 'text-gray-300' : 'text-gray-500'}`}>Monocromático e alto impacto.</span>
                    </div>
                    {activeMode === 'contraste' && <i className="fas fa-check text-white"></i>}
                  </button>
                </div>

                {/* Visualização do Efeito (Mockup) */}
                <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200 flex flex-col">
                    {/* Header do Mockup */}
                    <div className={`h-12 w-full flex items-center px-4 justify-between transition-colors duration-500
                        ${activeMode === 'normal' ? 'bg-brand-purple' : ''}
                        ${activeMode === 'protanopia' ? 'bg-[#5D5F9E]' : ''} // Simulação Roxo adaptado
                        ${activeMode === 'deuteranopia' ? 'bg-[#007598]' : ''} // Simulação Roxo/Azul adaptado
                        ${activeMode === 'contraste' ? 'bg-black' : ''}
                    `}>
                        <div className="w-20 h-3 bg-white/30 rounded-full"></div>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                            <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                    
                    {/* Corpo do Mockup */}
                    <div className="flex-1 p-6 flex items-center justify-center bg-white">
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto rounded-xl mb-4 flex items-center justify-center text-white text-2xl transition-colors duration-500
                                ${activeMode === 'normal' ? 'bg-brand-green' : ''}
                                ${activeMode === 'protanopia' ? 'bg-[#A9B348]' : ''} 
                                ${activeMode === 'deuteranopia' ? 'bg-[#D9A655]' : ''} 
                                ${activeMode === 'contraste' ? 'bg-black border-2 border-white text-white' : ''}
                            `}>
                                <i className="fas fa-check"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Tarefa Concluída</h4>
                            <button className={`px-6 py-2 rounded-lg text-white font-medium text-sm transition-colors duration-500
                                ${activeMode === 'normal' ? 'bg-brand-gradient' : ''}
                                ${activeMode === 'protanopia' ? 'bg-blue-600' : ''}
                                ${activeMode === 'deuteranopia' ? 'bg-yellow-600' : ''}
                                ${activeMode === 'contraste' ? 'bg-black border border-black hover:bg-white hover:text-black' : ''}
                            `}>
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Secção 2: Grid de Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Card: Leitores de Ecrã */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-volume-up"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Leitores de Ecrã</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Toda a plataforma é compatível com os principais leitores de ecrã, incluindo <strong>NVDA</strong>, <strong>JAWS</strong> e <strong>VoiceOver</strong>. Utilizamos etiquetas ARIA semânticas para descrever imagens, gráficos e estados de botões.
                </p>
            </div>

            {/* Card: Navegação por Teclado */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-purple-50 text-brand-purple flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-keyboard"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Navegação por Teclado</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    É possível navegar por todo o ecossistema sem usar o rato. O foco visual é claro e a ordem de tabulação é lógica, permitindo que utilizadores com limitações motoras operem com eficiência.
                </p>
            </div>

            {/* Card: Cognitivo e Foco */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-brand-green flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-brain"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Suporte Cognitivo</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    O <strong>Facillit Write</strong> e o <strong>Facillit Edu</strong> possuem modos de &quot;Leitura Simplificada&quot; e &quot;Foco Imersivo&quot;, removendo distrações visuais para auxiliar utilizadores com TDAH ou dificuldades de concentração.
                </p>
            </div>

            {/* Card: Legendas e Transcrições */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-closed-captioning"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Auditivo</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Todos os conteúdos de vídeo no <strong>Facillit Play</strong> possuem legendas automáticas e transcrições descarregáveis. Os alertas do sistema possuem indicadores visuais, não dependendo apenas de som.
                </p>
            </div>

            {/* Card: Texto Flexível */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-text-height"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Texto Flexível</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    A nossa fonte padrão, <strong>Inter</strong>, foi escolhida pela sua legibilidade. A plataforma suporta redimensionamento de texto até 200% sem quebra de layout ou perda de funcionalidade.
                </p>
            </div>

            {/* Card: Design Responsivo */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-mobile-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Adaptação a Dispositivos</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Seja no telemóvel, tablet ou computador, a interface adapta-se. Botões e áreas de toque são dimensionados para facilitar o uso por pessoas com dificuldades de precisão motora.
                </p>
            </div>
          </div>

          {/* Secção 3: Suporte Dedicado e Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-brand-purple rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h2 className="text-3xl font-bold mb-4">Precisa de Ajuda?</h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                    Temos uma equipa especializada em suporte acessível. Se encontrar alguma barreira ou tiver dificuldade em usar algum recurso, contacte-nos prioritariamente.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10">
                        <i className="fas fa-envelope text-2xl text-brand-green"></i>
                        <div>
                            <span className="block text-xs text-white/60 uppercase tracking-wider">E-mail Dedicado</span>
                            <a href="mailto:acessibilidade@facillithub.com" className="text-lg font-bold hover:text-brand-green transition-colors">acessibilidade@facillithub.com</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10">
                        <i className="fas fa-phone text-2xl text-brand-green"></i>
                        <div>
                            <span className="block text-xs text-white/60 uppercase tracking-wider">Telefone / WhatsApp (Voz e Texto)</span>
                            <span className="text-lg font-bold">+55 (11) 99999-9999</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportar um Problema</h2>
                <p className="text-gray-600 mb-6">
                    O seu feedback é essencial para a evolução do Facillit Hub. Utilize este formulário para relatar barreiras de acessibilidade.
                </p>
                
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Onde encontrou o problema?</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple outline-none">
                            <option>Navegação Geral</option>
                            <option>Leitor de Ecrã</option>
                            <option>Contraste / Cores</option>
                            <option>Vídeo / Áudio</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                        <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-brand-purple outline-none resize-none" placeholder="Descreva a dificuldade encontrada..."></textarea>
                    </div>
                    <button type="button" className="px-6 py-3 bg-brand-dark text-white font-bold rounded-lg hover:bg-brand-purple transition-colors w-full">
                        Enviar Relatório
                    </button>
                </form>
            </div>

          </div>

          {/* Declaração WCAG */}
          <div className="mt-16 text-center border-t border-gray-200 pt-10">
            <p className="text-sm text-gray-500">
                O Facillit Hub compromete-se a manter a conformidade com as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, Nível AA. <br />
                Esta página foi atualizada pela última vez em Outubro de 2025.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}