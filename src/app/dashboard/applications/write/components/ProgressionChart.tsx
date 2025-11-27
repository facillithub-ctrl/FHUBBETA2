"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActionPlan } from '../actions';

type ProgressionData = {
    date: string;
    grade: number;
};

type Props = {
    data: ProgressionData[];
    actionPlans: ActionPlan[];
};

export default function ProgressionChart({ data, actionPlans }: Props) {
    return (
        <div className="glass-card p-6 h-full flex flex-col">
            {/* Metade Superior: Gráfico de Progressão */}
            <div className="flex-1 min-h-[250px]">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Sua Progressão</h3>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="date" tick={{ fill: '#a0a0a0' }} fontSize={12} />
                            <YAxis domain={[0, 1000]} tick={{ fill: '#a0a0a0' }} fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                                    borderColor: '#2f2f2f',
                                    borderRadius: '0.5rem'
                                }}
                                labelStyle={{ color: '#f9fafb' }}
                            />
                            <Line type="monotone" dataKey="grade" name="Nota" stroke="#5e55f9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                         <p className="text-text-muted dark:text-dark-text-muted">Envie redações para ver seu gráfico de evolução.</p>
                    </div>
                )}
            </div>

            {/* Linha divisória */}
            <hr className="border-white/20 my-4" />

            {/* Metade Inferior: Plano de Prática */}
            <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white mb-4">Plano de Prática (Baseado na IA)</h3>
                <div className="h-full overflow-y-auto pr-2 max-h-[200px]">
                    {actionPlans.length > 0 ? (
                         <ul className="space-y-2">
                            {actionPlans.map((plan) => (
                                <li key={plan.id} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="mt-0.5 text-royal-blue"><i className="fas fa-check-circle"></i></div>
                                    <div>
                                        <p className="text-sm font-medium text-dark-text dark:text-gray-200">{plan.text}</p>
                                        {plan.source_essay && (
                                            <p className="text-[10px] text-text-muted mt-1">Sugerido na correção de: {plan.source_essay}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-sm text-text-muted dark:text-gray-400">
                                Ao receber correções, a IA irá sugerir pontos de melhoria aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}