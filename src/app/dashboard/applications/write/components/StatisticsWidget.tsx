"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type FrequentError = { error_type: string; count: number };

export default function StatisticsWidget({ stats, frequentErrors }: { stats: Stats, frequentErrors: FrequentError[] }) {
    if (!stats) return null;

    const radarData = [
        { subject: 'Norma Culta (C1)', A: stats.averages.avg_c1, fullMark: 200 },
        { subject: 'Tema (C2)', A: stats.averages.avg_c2, fullMark: 200 },
        { subject: 'Argumentação (C3)', A: stats.averages.avg_c3, fullMark: 200 },
        { subject: 'Coesão (C4)', A: stats.averages.avg_c4, fullMark: 200 },
        { subject: 'Proposta (C5)', A: stats.averages.avg_c5, fullMark: 200 },
    ];

    const errorData = frequentErrors.slice(0, 5).map(e => ({
        name: e.error_type,
        count: e.count
    }));

    return (
        <div className="space-y-8">
            {/* Radar de Competências */}
            <div>
                <h4 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-bullseye text-[#42047e]"></i> Radar de Competências
                </h4>
                <div className="h-64 w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                            <Radar name="Média" dataKey="A" stroke="#42047e" fill="#42047e" fillOpacity={0.4} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Média por competência (0-200)</p>
            </div>

            {/* Gráfico de Erros Frequentes */}
            <div>
                <h4 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-[#07f49e]"></i> Erros Mais Comuns
                </h4>
                {errorData.length > 0 ? (
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={errorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="#07f49e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Sem dados de erros suficientes.</p>
                )}
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-[#42047e]/10 to-[#07f49e]/10 p-4 rounded-xl border border-[#42047e]/20">
                <h4 className="font-bold text-[#42047e] dark:text-purple-300 text-sm mb-2"><i className="fas fa-lightbulb mr-2"></i> Insight da IA</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                    Seu ponto forte é a <strong>Competência 2</strong>. Para atingir 900+, foque em melhorar a <strong>{stats.pointToImprove.name}</strong> ({stats.pointToImprove.average.toFixed(0)} pontos).
                </p>
            </div>
        </div>
    );
}