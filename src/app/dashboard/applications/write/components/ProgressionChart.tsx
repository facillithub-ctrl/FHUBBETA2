"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type ProgressionData = {
    date: string;
    grade: number;
};

// Removemos actionPlans das props pois agora isso é responsabilidade do widget dedicado
type Props = {
    data: ProgressionData[];
    actionPlans?: any[]; // Mantido como opcional apenas para compatibilidade, mas não usado
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-[#42047e] dark:text-[#07f49e] font-black text-lg">
                    {payload[0].value} <span className="text-xs font-normal text-gray-400">pontos</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function ProgressionChart({ data }: Props) {
    // Se não houver dados suficientes, mostramos um estado vazio bonito
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 z-10">
                    <i className="fas fa-chart-area text-gray-300 text-2xl"></i>
                </div>
                <p className="text-gray-500 font-medium z-10">Ainda não há dados suficientes para gerar o gráfico.</p>
                <p className="text-xs text-gray-400 mt-1 z-10">Envie sua primeira redação para começar a rastrear.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#42047e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#42047e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10 }} 
                        dy={10}
                    />
                    
                    <YAxis 
                        domain={[0, 1000]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#42047e', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    
                    {/* Linha de Meta (Ex: 900 pontos) */}
                    <ReferenceLine y={900} stroke="#07f49e" strokeDasharray="3 3" label={{ value: 'Meta 900+', position: 'insideTopRight', fill: '#07f49e', fontSize: 10 }} />
                    
                    <Area 
                        type="monotone" 
                        dataKey="grade" 
                        stroke="#42047e" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorGrade)" 
                        activeDot={{ r: 6, fill: "#fff", stroke: "#42047e", strokeWidth: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}