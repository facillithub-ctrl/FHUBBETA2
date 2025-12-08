"use client";

export type PlagiarismResult = {
  similarity_percentage: number;
  matches: { source: string; text: string }[];
};

type Props = {
  result: PlagiarismResult | null;
  onClose: () => void;
};

export default function PlagiarismResultModal({ result, onClose }: Props) {
  if (!result) return null;

  const getPillColor = (percentage: number) => {
    if (percentage > 20) return 'bg-red-500';
    if (percentage > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Resultado da Verificação de Plágio</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-text-muted dark:text-gray-400">Similaridade encontrada</p>
            <div className={`inline-block text-white px-4 py-1 rounded-full text-2xl font-bold my-2 ${getPillColor(result.similarity_percentage)}`}>
              {result.similarity_percentage.toFixed(2)}%
            </div>
          </div>
          
          {result.matches.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold">Trechos correspondentes:</h4>
              {result.matches.map((match, index) => (
                <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm italic">{match.text}</p>
                  <p className="text-xs text-right mt-2 text-text-muted">Fonte simulada: <strong>{match.source}</strong></p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-green-600 dark:text-green-400">Nenhuma similaridade significativa encontrada. Ótimo trabalho!</p>
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700 text-right">
          <button onClick={onClose} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}