'use client'

import { LibraryInsights } from '../actions';

export default function GamificationWidget({ insights }: { insights: LibraryInsights }) {
  const progressToNextLevel = (insights.totalXP / insights.nextLevelXP) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-royal-blue rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <i className="fas fa-trophy text-9xl"></i>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        {/* Level Badge */}
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white/20">
            <span className="text-3xl font-black text-indigo-900">{insights.currentLevel}</span>
          </div>
          <div className="absolute -bottom-2 inset-x-0 text-center">
            <span className="bg-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-white/20">Nível</span>
          </div>
        </div>

        {/* Info & Bar */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="font-bold text-lg">Leitor Dedicado</h3>
              <p className="text-xs text-blue-200">Continue lendo para evoluir!</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-yellow-400">{insights.totalXP}</span>
              <span className="text-xs text-blue-200"> / {insights.nextLevelXP} XP</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}