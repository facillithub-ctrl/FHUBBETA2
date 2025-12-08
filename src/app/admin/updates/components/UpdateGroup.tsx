"use client";

import { useState } from 'react';
import type { Update } from '@/app/(hubs)/education/dashboard/types';

const moduleNames: { [key: string]: string } = {
  'facillit-write': 'Facillit Write',
  'facillit-test': 'Facillit Test',
  'general': 'Geral',
};

const categoryStyles: { [key: string]: string } = {
    'Nova Funcionalidade': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Melhoria': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Correção': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};

const UpdateCard = ({ update }: { update: Update }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border dark:border-gray-700 rounded-lg p-5">
            <p className="text-sm text-text-muted dark:text-gray-400 mb-2">
                {new Date(update.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <h4 className="font-bold text-lg text-dark-text dark:text-white mb-3">{update.title}</h4>
            <div className="flex items-center gap-2 mb-4">
                {update.version && (
                    <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        v{update.version}
                    </span>
                )}
                 {update.category && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryStyles[update.category] || 'bg-gray-200'}`}>
                        {update.category}
                    </span>
                )}
            </div>

            <div 
                className={`prose prose-sm dark:prose-invert max-w-none text-text-muted dark:text-gray-300 transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-12 overflow-hidden opacity-70'}`}
                dangerouslySetInnerHTML={{ __html: update.content }} 
            />

            <button onClick={() => setIsExpanded(!isExpanded)} className="text-royal-blue font-bold text-sm mt-3">
                {isExpanded ? 'Ler menos' : 'Ler mais...'}
            </button>
        </div>
    );
};

export default function UpdateGroup({ moduleSlug, updates }: { moduleSlug: string, updates: Update[] }) {
    const moduleName = moduleNames[moduleSlug] || moduleSlug;
    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text dark:text-white pb-3 mb-6 border-b-2 border-royal-blue">
                {moduleName}
            </h2>
            <div className="space-y-6">
                {updates.map(update => <UpdateCard key={update.id} update={update} />)}
            </div>
        </div>
    );
}