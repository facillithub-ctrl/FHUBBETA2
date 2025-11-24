"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressionChart({ data }: { data: any[] }) {
    return (
        <div className="h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#07f49e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#07f49e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis domain={[0, 1000]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1A1D', borderRadius: '8px', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#07f49e' }}
                    />
                    <Area type="monotone" dataKey="grade" stroke="#07f49e" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}