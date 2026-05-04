'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Report {
    stolenObject: string;
}

interface Props {
    reports: Report[];
}

export default function EstadisticasSeguridad({ reports }: Props) {
    // 1. Procesar los datos
    const counts = reports.reduce((acc: Record<string, number>, curr) => {
        const item = curr.stolenObject || 'Otros';
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    const data = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
    })).sort((a, b) => b.value - a.value);

    // 2. Colores exactos de tu segunda imagen
    const COLORS = [
        '#13505B', // Azul oscuro / Petróleo
        '#EB7E31', // Naranja
        '#1D7A27', // Verde
        '#00A3E0', // Azul claro
        '#A12181', // Púrpura / Otros
        '#56B947', // Verde claro
        '#0B3044'  // Azul noche
    ];

    const total = reports.length;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50">
            <h3 className="text-xl font-black text-emerald-900 mb-8 text-center uppercase tracking-tight">
                CANTIDAD DE REGISTROS (N={total})
            </h3>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="40%" // Movido un poco a la izquierda para dejar espacio a la leyenda
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            // Eliminamos innerRadius para que sea un círculo completo
                            label={({ value, percent }) =>
                                `${value}, ${(percent ? percent * 100 : 0).toFixed(0)}%`
                            }
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        {/* 3. Leyenda al costado derecho */}
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="square"
                            wrapperStyle={{
                                paddingLeft: "20px",
                                fontFamily: "sans-serif",
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#475569"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-8 tracking-widest">
                Distribución por tipo de objeto sustraído en tiempo real - Iquitos
            </p>
        </div>
    );
}