// O caminho da importação foi corrigido para buscar de 'dashboard/types'
import type { Update } from '@/app/(hubs)/education/dashboard/types';

const moduleNames: { [key: string]: string } = {
  'facillit-write': 'Facillit Write',
  'facillit-test': 'Facillit Test',
  'general': 'Geral',
};

export default function UpdateItem({ update }: { update: Update }) {
    const moduleName = update.module_slug ? moduleNames[update.module_slug] || update.module_slug : 'Geral';

    return (
        <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="absolute -left-[11px] top-1 w-5 h-5 bg-royal-blue rounded-full border-4 border-white dark:border-dark-background"></div>
            <p className="text-sm text-text-muted dark:text-gray-400 mb-1">
                {new Date(update.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <h3 className="font-bold text-xl text-dark-text dark:text-white mb-2">{update.title}</h3>
            {update.version && (
                <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full mr-2">
                    v{update.version}
                </span>
            )}
            <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-royal-blue px-2 py-0.5 rounded-full">
                {moduleName}
            </span>
            <div className="prose prose-sm dark:prose-invert mt-4 text-text-muted dark:text-gray-300">
                <p>{update.content}</p>
            </div>
        </div>
    );
};