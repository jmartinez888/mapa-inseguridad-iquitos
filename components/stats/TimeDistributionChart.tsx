'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface TimeData {
    name: string;
    value: number;
}

interface TimeDistributionChartProps {
    data: TimeData[];
}

const MOMENTOS_COLORS: Record<string, string> = {
    'Mañana': '#F59E0B',
    'Tarde': '#EF4444',
    'Noche': '#6366F1',
    'Madrugada': '#10B981',
    'No recuerdo': '#64748B'
};

export default function TimeDistributionChart({ data = [] }: TimeDistributionChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const filteredData = data.filter(item => item.value > 0);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 h-[450px] flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">
                Horario de los Incidentes
            </h3>

            <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
                    <span className="text-4xl font-black text-[#0F172A]">{total}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            innerRadius={75}
                            outerRadius={95}
                            paddingAngle={filteredData.length > 1 ? 5 : 0}
                            dataKey="value"
                            stroke="none"
                            label={(props: { percent: number }) => `${(props.percent * 100).toFixed(0)}%`}
                        >
                            {filteredData.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={MOMENTOS_COLORS[entry.name] || '#CBD5E1'}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            iconType="circle" 
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} 
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}