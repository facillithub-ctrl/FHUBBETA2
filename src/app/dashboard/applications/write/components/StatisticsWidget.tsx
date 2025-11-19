import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type Stats = {
    totalCorrections: number;
    averages: {
        avg_final_grade: number;
        avg_c1: number;
        avg_c2: number;
        avg_c3: number;
        avg_c4: number;
        avg_c5: number;
    };
    pointToImprove: { name: string; average: number };
};

type FrequentError = { error_type: string; count: number };

type Props = {
    stats: Stats;
    frequentErrors: FrequentError[];
}

const FrequentErrorsChart = ({ data }: { data: FrequentError[] }) => {
  if (!data || data.length === 0) return null;
  // Paleta de cores atualizada para combinar com o Facillit Hub
  const COLORS = ['#42047E', '#07F49E', '#5E55F9', '#A78BFA', '#34D399'];
  
  return (
    <div className="mt-6">
      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 text-center">Erros Mais Comuns</h4>
      <div className="h-[180px] relative">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie 
                data={data} 
                dataKey="count" 
                nameKey="error_type" 
                cx="50%" 
                cy="50%" 
                innerRadius={40} // Donut Chart é mais moderno
                outerRadius={70} 
                paddingAngle={5}
                cornerRadius={5}
            >
                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1D', borderColor: '#333', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
            />
            </PieChart>
        </ResponsiveContainer>
        {/* Texto no meio do Donut */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
             <i className="fas fa-exclamation-triangle text-gray-300"></i>
        </div>
      </div>
    </div>
  );
};

export default function StatisticsWidget({ stats, frequentErrors }: Props) {
    // Calcula médias para barras de progresso simples
    const competencies = [
        { id: 1, label: 'Norma Culta', val: stats.averages.avg_c1 },
        { id: 2, label: 'Tema/Estrutura', val: stats.averages.avg_c2 },
        { id: 3, label: 'Argumentação', val: stats.averages.avg_c3 },
        { id: 4, label: 'Coesão', val: stats.averages.avg_c4 },
        { id: 5, label: 'Proposta', val: stats.averages.avg_c5 },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h3 className="font-bold text-lg dark:text-white mb-1">Análise de Competências</h3>
                <p className="text-xs text-text-muted">Média por competência (0-200)</p>
            </div>

            <div className="space-y-3 flex-1">
                {competencies.map((comp) => (
                    <div key={comp.id}>
                        <div className="flex justify-between text-xs mb-1 font-medium text-text-secondary">
                            <span>C{comp.id} - {comp.label}</span>
                            <span className={comp.val >= 160 ? 'text-brand-green' : comp.val < 120 ? 'text-red-500' : 'text-yellow-500'}>
                                {comp.val.toFixed(0)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${comp.val >= 160 ? 'bg-brand-green' : comp.val < 120 ? 'bg-red-400' : 'bg-yellow-400'}`}
                                style={{ width: `${(comp.val / 200) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.pointToImprove && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-2xl flex items-start gap-3">
                    <div className="bg-white dark:bg-red-900/20 p-2 rounded-full text-red-500 text-xs">
                        <i className="fas fa-bullseye"></i>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase">Foco de Melhoria</h4>
                        <p className="text-sm text-red-700 dark:text-red-200 mt-0.5">
                            Dê atenção extra à <strong>{stats.pointToImprove.name}</strong> na próxima redação.
                        </p>
                    </div>
                </div>
            )}

            <FrequentErrorsChart data={frequentErrors} />
        </div>
    );
}