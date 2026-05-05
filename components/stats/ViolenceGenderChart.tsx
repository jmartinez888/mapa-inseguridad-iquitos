'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ViolenceGenderChart({ data }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 h-[450px] flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">
                Nivel de Violencia por Género
            </h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="genero"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="square"
                            wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '30px' }}
                        />
                        {/* Eliminamos stackId="a" y cambiamos la posición del label a 'top' para mejor visibilidad */}
                        <Bar
                            dataKey="Con violencia"
                            fill="#D64545"
                            radius={[6, 6, 0, 0]}
                            label={{ position: 'top', fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Bar
                            dataKey="Intento"
                            fill="#EAB308"
                            radius={[6, 6, 0, 0]}
                            label={{ position: 'top', fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Bar
                            dataKey="Sin violencia"
                            fill="#10B981"
                            radius={[6, 6, 0, 0]}
                            label={{ position: 'top', fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}