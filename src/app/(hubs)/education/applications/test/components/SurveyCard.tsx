import React from 'react';

type SurveyInfo = {
  id: string;
  title: string;
  description?: string | null;
  question_count: number;
  points: number;
  is_campaign_test?: boolean;
};

type Props = {
  survey: SurveyInfo;
  onStart: (id: string) => void;
};

const SurveyCard = ({ survey, onStart }: Props) => {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-sm border border-pink-100 dark:border-gray-700 hover:shadow-md hover:border-pink-300 transition-all group flex flex-col h-full relative overflow-hidden">
        
        {/* Decorator Background */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-pink-100 text-pink-700 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm">
                <i className="fas fa-poll-h"></i>
            </div>
            {survey.points > 0 && (
                <span className="bg-white dark:bg-gray-700 text-xs font-bold px-2 py-1 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400"></i> +{survey.points}
                </span>
            )}
        </div>

        <div className="flex-grow relative z-10">
            <h3 className="font-bold text-lg text-dark-text dark:text-white mb-2 group-hover:text-pink-600 transition-colors">
                {survey.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {survey.description || "Participe desta pesquisa de opinião."}
            </p>
        </div>

        <div className="mt-auto pt-4 border-t border-pink-100 dark:border-gray-700 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded">
                    Pesquisa
                </span>
                <span className="text-xs text-gray-400">
                    {survey.question_count} perguntas
                </span>
            </div>
            
            <button 
                onClick={() => onStart(survey.id)}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                Responder Agora <i className="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
  );
};

export default SurveyCard;