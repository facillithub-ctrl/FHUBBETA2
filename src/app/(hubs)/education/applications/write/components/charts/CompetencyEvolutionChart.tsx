"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CompetencyEvolutionChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">Sem dados.</div>;

    return (
        <div className="h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={10} tick={{fill: '#888'}} />
                    <YAxis domain={[0, 200]} fontSize={10} tick={{fill: '#888'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="c1" stroke="#8884d8" strokeWidth={2} dot={false} name="C1" />
                    <Line type="monotone" dataKey="c2" stroke="#82ca9d" strokeWidth={2} dot={false} name="C2" />
                    <Line type="monotone" dataKey="c3" stroke="#ffc658" strokeWidth={2} dot={false} name="C3" />
                    <Line type="monotone" dataKey="c4" stroke="#ff7300" strokeWidth={2} dot={false} name="C4" />
                    <Line type="monotone" dataKey="c5" stroke="#07f49e" strokeWidth={2} dot={false} name="C5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}