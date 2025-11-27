"use client";

import React from 'react';
import Image from 'next/image';

// Tipagem alinhada com o retorno do banco
export type TestCardInfo = {
  id: string;
  title: string;
  subject: string | null;
  question_count: number;
  duration_minutes: number;
  difficulty: string | null;
  points: number;
  test_type: 'avaliativo' | 'pesquisa';
  hasAttempted: boolean;
  cover_image_url?: string | null;
  is_campaign_test?: boolean;
};

type Props = {
  test: TestCardInfo;
  onStart: (id: string) => void;
  onViewDetails: (id: string) => void;
};

const difficultyColors: Record<string, string> = {
  facil: 'bg-green-100 text-green-700 border-green-200',
  medio: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  dificil: 'bg-red-100 text-red-700 border-red-200',
  muito_dificil: 'bg-purple-100 text-purple-700 border-purple-200'
};

const difficultyLabels: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
  muito_dificil: 'Muito Difícil'
};

const AvailableTestCard = ({ test, onStart, onViewDetails }: Props) => {
  return (
    <div 
        onClick={() => onViewDetails(test.id)}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      
      {/* 1. Área da Capa */}
      <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {test.cover_image_url ? (
          <Image 
            src={test.cover_image_url} 
            alt={test.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          // Fallback: Gradiente bonito se não houver capa
          <div className={`absolute inset-0 bg-gradient-to-br flex items-center justify-center ${
              test.subject === 'Matemática' ? 'from-blue-500 to-indigo-600' :
              test.subject === 'Português' ? 'from-orange-400 to-red-500' :
              test.subject === 'Biologia' ? 'from-green-400 to-emerald-600' :
              'from-royal-blue to-purple-600'
          }`}>
            <i className={`fas fa-${
                test.subject === 'Matemática' ? 'calculator' : 
                test.subject === 'Português' ? 'book' : 
                test.subject === 'Biologia' ? 'leaf' : 'graduation-cap'
            } text-4xl text-white/20`}></i>
          </div>
        )}
        
        {/* Overlay Gradiente para leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Badges Flutuantes */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border border-white/10 ${
                test.test_type === 'avaliativo' 
                ? 'bg-blue-600/90 text-white' 
                : 'bg-pink-500/90 text-white'
            }`}>
                {test.test_type === 'avaliativo' ? 'Avaliação' : 'Pesquisa'}
            </span>
            
            {test.is_campaign_test && (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm bg-yellow-400 text-yellow-900 border border-yellow-300 flex items-center gap-1">
                    <i className="fas fa-trophy"></i> Campanha
                </span>
            )}
        </div>

        {/* Pontos de XP */}
        {(test.points || 0) > 0 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10 shadow-lg">
                <i className="fas fa-star text-yellow-400 text-[10px]"></i> +{test.points} XP
            </div>
        )}
      </div>

      {/* 2. Conteúdo do Card */}
      <div className="p-5 flex flex-col flex-grow relative">
        {/* Dificuldade e Matéria */}
        <div className="flex justify-between items-center mb-3">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${difficultyColors[test.difficulty || 'medio'] || difficultyColors.medio}`}>
                {difficultyLabels[test.difficulty || 'medio'] || 'Médio'}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-600">
                {test.subject || 'Geral'}
            </span>
        </div>

        <h3 className="font-bold text-lg text-dark-text dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-royal-blue transition-colors">
            {test.title}
        </h3>

        {/* Metadados (Tempo e Questões) */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5" title="Duração estimada">
                <i className="far fa-clock text-royal-blue/70"></i> {test.duration_minutes} min
            </div>
            <div className="flex items-center gap-1.5" title="Quantidade de questões">
                <i className="far fa-list-alt text-royal-blue/70"></i> {test.question_count} questões
            </div>
        </div>
      </div>

      {/* 3. Footer com Botões */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-3">
        <button 
            onClick={(e) => { e.stopPropagation(); onViewDetails(test.id); }}
            className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            Detalhes
        </button>
        <button 
            onClick={(e) => { 
                e.stopPropagation(); // IMPORTANTE: Impede que o clique no botão abra os detalhes
                onStart(test.id); 
            }}
            className={`py-2.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                test.hasAttempted 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20' 
                : 'bg-royal-blue text-white hover:bg-blue-700 shadow-blue-500/20'
            }`}
        >
            {test.hasAttempted ? 'Refazer' : 'Começar'} <i className={`fas ${test.hasAttempted ? 'fa-redo' : 'fa-play'} text-xs`}></i>
        </button>
      </div>
    </div>
  );
};

export default AvailableTestCard;