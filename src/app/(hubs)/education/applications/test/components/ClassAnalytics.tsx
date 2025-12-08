"use client";

import { useState, useEffect } from 'react';
import createClient from '@/utils/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ClassAnalyticsProps = {
  classId: string;
  onBack: () => void;
};

type StudentPerformance = {
  student_id: string;
  student_name: string;
  average_score: number;
  total_attempts: number;
};

type AxisPerformance = {
  axis: string;
  average_score: number;
};

type ClassAnalyticsData = {
  student_performance: StudentPerformance[];
  axis_performance: AxisPerformance[];
};

const ClassAnalytics = ({ classId, onBack }: ClassAnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState<ClassAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_class_analytics', { p_class_id: classId });

      if (error) {
        setError("Erro ao carregar as estatísticas da turma.");
        console.error(error);
      } else {
        setAnalyticsData(data);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [classId]);

  if (isLoading) {
    return <div className="text-center p-8">Carregando estatísticas da turma...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm font-bold text-royal-blue mb-6">
        <i className="fas fa-arrow-left mr-2"></i> Voltar
      </button>
      <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Análise da Turma</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Desempenho por Aluno</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.student_performance} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="student_name" />
              <Tooltip />
              <Bar dataKey="average_score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Desempenho por Eixo Temático</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.axis_performance}>
              <XAxis dataKey="axis" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="average_score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;