'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Definimos la estructura exacta que deben tener los objetos de datos
interface StolenItemData {
    name: string;
    value: number;
}

interface StolenItemsChartProps {
    data: StolenItemData[];
    total: number;
}

const BASE_COLORS = ['#13505B', '#10B981', '#EB7E31', '#1D7A27', '#0F172A', '#64748B'];

export default function StolenItemsChart({ data = [], total }: StolenItemsChartProps) {
    
    // --- PROCESAMIENTO INTERNO ---
    const TOP_LIMIT = 5;
    
    // Clonamos y ordenamos el arreglo usando el tipado correcto
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    let processedData: StolenItemData[] = sortedData.slice(0, TOP_LIMIT);
    
    if (sortedData.length > TOP_LIMIT) {
        const restValue = sortedData.slice(TOP_LIMIT).reduce((sum, item) => sum + item.value, 0);
        
        const existingOtrosIndex = processedData.findIndex(i => i.name.toLowerCase() === 'otros');
        if (existingOtrosIndex !== -1) {
            processedData[existingOtrosIndex].value += restValue;
        } else {
            processedData.push({ name: 'Otros', value: restValue });
        }
    }
    
    processedData = processedData.sort((a, b) => b.value - a.value);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 h-[450px] flex flex-col">
            <div className="mb-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Objetos Sustraídos</h3>
                <p className="text-[10px] text-slate-300 font-bold uppercase">Muestra total de {total} registros</p>
            </div>

            <div className="flex-1 relative">
                {/* Indicador Central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
                    <span className="text-4xl font-black text-[#0F172A]">{total}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={processedData}
                            innerRadius={75}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {processedData.map((_entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={BASE_COLORS[index % BASE_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            formatter={(value: string) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize', paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}