"use client";

import { useState } from 'react';
import { Test, Campaign } from '../actions';


// Tipos simulados para os dados que o componente receberá
type Result = {
  id: string;
  student_name: string;
  test_title: string;
  score: number;
  date: string;
  class_id?: string; // Opcional, para filtrar por turma
  class_name?: string | null;
};

type ResultsDashboardProps = {
  results: Result[];
  onViewDetails: (testId: string) => void;
};


const ResultsDashboard = ({ results: initialResults, onViewDetails }: ResultsDashboardProps) => {
  const [results, setResults] = useState<Result[]>(initialResults);
  const [filterTest, setFilterTest] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  const filteredResults = results.filter(result => {
      const matchesTest = filterTest ? result.test_title.toLowerCase().includes(filterTest.toLowerCase()) : true;
      const matchesStudent = filterStudent ? result.student_name.toLowerCase().includes(filterStudent.toLowerCase()) : true;
      return matchesTest && matchesStudent;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };


  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Resultados dos Alunos</h2>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text"
            placeholder="Filtrar por nome do aluno..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <input 
            type="text"
            placeholder="Filtrar por nome do simulado..."
            value={filterTest}
            onChange={(e) => setFilterTest(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
      </div>

      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Aluno</th>
              <th scope="col" className="px-6 py-3">Avaliação</th>
              <th scope="col" className="px-6 py-3">Turma</th>
              <th scope="col" className="px-6 py-3 text-center">Pontuação</th>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length > 0 ? filteredResults.map((result) => (
              <tr key={result.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 font-medium text-dark-text dark:text-white">{result.student_name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{result.test_title}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{result.class_name || '-'}</td>
                <td className={`px-6 py-4 text-center font-bold text-lg ${getScoreColor(result.score)}`}>{result.score}%</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(result.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onViewDetails(result.id)} className="font-medium text-royal-blue hover:underline">Ver Detalhes</button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Nenhum resultado encontrado para os filtros aplicados.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDashboard;