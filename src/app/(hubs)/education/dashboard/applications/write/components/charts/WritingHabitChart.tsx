"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WritingHabitChart({ data }: { data: any[] }) {
    // Mock de dados se vier vazio (para demo)
    const chartData = data.length > 0 ? data : [
        { day: 'Seg', essays: 2 }, { day: 'Ter', essays: 1 }, { day: 'Qua', essays: 3 },
        { day: 'Qui', essays: 0 }, { day: 'Sex', essays: 4 }, { day: 'Sáb', essays: 2 }, { day: 'Dom', essays: 1 }
    ];

    return (
        <div className="h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="day" fontSize={12} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="essays" fill="#42047e" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}