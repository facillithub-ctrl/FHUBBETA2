"use client";

import { useState, useEffect } from 'react';
import { getSurveyResults } from '../actions';
import { useToast } from '@/contexts/ToastContext';

type SurveyResult = {
    question_statement: string;
    student_name: string;
    student_answer: any;
    submitted_at: string;
};

type Props = {
    testId: string;
    testTitle: string;
    onBack: () => void;
};

// Função para tentar extrair a opção de múltipla escolha do HTML da pergunta
const getOptionTextFromStatement = (statement: string, optionIndex: number): string => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(statement, 'text/html');
        const options = Array.from(doc.querySelectorAll('li, p'));
        if (options.length > optionIndex && options[optionIndex].textContent) {
            return options[optionIndex].textContent!;
        }
    } catch (e) {
        console.error("Erro ao parsear HTML da questão:", e);
    }
    // Fallback caso não consiga extrair o texto
    return `Opção ${String.fromCharCode(65 + optionIndex)}`;
};


export default function SurveyResultsView({ testId, testTitle, onBack }: Props) {
    const [results, setResults] = useState<SurveyResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            const res = await getSurveyResults(testId);
            if (res.error) {
                addToast({ title: "Erro ao Carregar", message: res.error, type: 'error' });
            } else {
                setResults(res.data || []);
            }
            setIsLoading(false);
        };
        fetchResults();
    }, [testId, addToast]);

    const formatAnswer = (answer: any, questionStatement: string): string => {
        if (typeof answer === 'number') {
            return getOptionTextFromStatement(questionStatement, answer);
        }
        return String(answer);
    };

    const downloadCSV = () => {
        if (results.length === 0) {
            addToast({ title: "Aviso", message: "Não há dados para exportar.", type: 'error' });
            return;
        }

        const headers = ["Aluno", "Pergunta", "Resposta", "Data de Envio"];
        const csvContent = [
            headers.join(','),
            ...results.map(r => [
                `"${r.student_name.replace(/"/g, '""')}"`,
                `"${r.question_statement.replace(/"/g, '""').replace(/<[^>]*>/g, '')}"`, // Remove HTML
                `"${formatAnswer(r.student_answer, r.question_statement).replace(/"/g, '""')}"`,
                `"${new Date(r.submitted_at).toLocaleString('pt-BR')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `resultados_${testTitle.replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <button onClick={onBack} className="text-sm font-bold text-royal-blue mb-6">
                <i className="fas fa-arrow-left mr-2"></i> Voltar
            </button>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text dark:text-white">Resultados da Pesquisa</h1>
                    <p className="text-text-muted">{testTitle}</p>
                </div>
                <button onClick={downloadCSV} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                    <i className="fas fa-file-csv mr-2"></i> Baixar Tabela (CSV)
                </button>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md">
                {isLoading ? (
                    <p className="text-center p-8">Carregando os resultados...</p>
                ) : results.length > 0 ? (
                    <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Aluno</th>
                                    <th scope="col" className="px-6 py-3">Pergunta</th>
                                    <th scope="col" className="px-6 py-3">Resposta</th>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium dark:text-white">{result.student_name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: result.question_statement }}></td>
                                        <td className="px-6 py-4 font-semibold text-royal-blue">{formatAnswer(result.student_answer, result.question_statement)}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(result.submitted_at).toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center p-8 text-gray-500">Nenhuma resposta foi enviada para esta pesquisa ainda.</p>
                )}
            </div>
        </div>
    );
}