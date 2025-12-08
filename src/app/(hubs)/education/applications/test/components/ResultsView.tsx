"use client";

import React from "react";

// --- TIPOS ---
type AttemptHistory = {
  id: string;
  completed_at: string | null;
  score: number | null;
  tests: {
    title: string | null;
    subject: string | null;
    questions: { count: number }[] | null;
  } | null;
};

type Props = {
  attempts: AttemptHistory[];
  onBack: () => void;
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "text-gray-500";
  if (score >= 70) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
};

// --- COMPONENTE PRINCIPAL ---
export default function ResultsView({ attempts, onBack }: Props) {
  const handleGenerateCertificate = (attemptId: string) => {
    // Lógica para gerar o certificado será implementada aqui
    alert(`Gerando certificado para a tentativa: ${attemptId}`);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm font-bold text-royal-blue mb-6">
        <i className="fas fa-arrow-left mr-2"></i> Voltar para o Dashboard
      </button>

      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meus Resultados</h1>

      <div className="glass-card p-4">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-dark-text-muted uppercase sticky top-0 bg-white/20 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-3">Simulado</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3 text-center">Questões</th>
                <th scope="col" className="px-6 py-3 text-right">Nota Final</th>
                <th scope="col" className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-white/10 hover:bg-black/10">
                    <td className="px-6 py-4 font-medium text-dark-text dark:text-white">
                      {attempt.tests?.title || "Teste Rápido"}
                      {attempt.tests?.subject && (
                        <span className="block text-xs text-dark-text-muted">{attempt.tests.subject}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark-text-muted">
                      {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4 text-dark-text-muted text-center">
                      {attempt.tests?.questions?.[0]?.count || "-"}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${getScoreColor(attempt.score)}`}>
                      {attempt.score?.toFixed(0) ?? "N/A"}%
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button
                            onClick={() => handleGenerateCertificate(attempt.id)}
                            className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <i className="fas fa-certificate mr-2"></i>
                            Gerar Certificado
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-dark-text-muted">
                    Você ainda não completou nenhum simulado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}