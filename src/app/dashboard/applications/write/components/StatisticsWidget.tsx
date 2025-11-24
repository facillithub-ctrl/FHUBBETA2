"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

type Stats = { totalCorrections: number; averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; }; pointToImprove: { name: string; average: number }; };
type FrequentError = { error_type: string; count: number };
type Props = { stats: Stats; frequentErrors: FrequentError[]; };

export default function StatisticsWidget({ stats, frequentErrors }: Props) {
    if (!stats || !stats.averages) return <div className="h-full flex items-center justify-center text-gray-400">Sem dados suficientes para o radar.</div>;
    const radarData = [ { subject: 'C1', A: stats.averages.avg_c1, fullMark: 200 }, { subject: 'C2', A: stats.averages.avg_c2, fullMark: 200 }, { subject: 'C3', A: stats.averages.avg_c3, fullMark: 200 }, { subject: 'C4', A: stats.averages.avg_c4, fullMark: 200 }, { subject: 'C5', A: stats.averages.avg_c5, fullMark: 200 } ];

    return (
        <div className="flex flex-col h-full">
            <h3 className="font-bold mb-4 dark:text-white">Radar de Competências</h3>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                        <Radar name="Média" dataKey="A" stroke="#42047e" strokeWidth={3} fill="#42047e" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#42047e', fontWeight: 'bold' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}