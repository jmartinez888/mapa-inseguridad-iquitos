'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DistrictChart({ data }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 h-[450px] flex flex-col">
            <h3 className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-8">
                Frecuencia por Distrito
            </h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                        barGap={0}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 11 }}
                            domain={[0, 3]}
                            ticks={[0, 1, 2, 3]}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '12px'
                            }}
                        />
                        {/* Azul oscuro petróleo con fondo gris claro para imitar la imagen */}
                        <Bar
                            dataKey="cantidad"
                            fill="#336B87"
                            // CORRECCIÓN: Cambia el array por un número simple
                            radius={2}
                            barSize={35}
                            background={{ fill: '#F1F5F9', radius: 2 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}