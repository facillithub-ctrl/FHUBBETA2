"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#42047e', '#07f49e', '#FFBB28', '#FF8042', '#8884d8'];

export default function ErrorDistributionChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">Sem dados de erros.</div>;

    return (
        <div className="h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="error_type"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}