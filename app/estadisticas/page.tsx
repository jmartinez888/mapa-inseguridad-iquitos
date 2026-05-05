'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Importación de componentes de analítica con diseño unificado
import DistrictChart from '@/components/stats/DistrictChart'
import TimeDistributionChart from '@/components/stats/TimeDistributionChart'
import ViolenceGenderChart from '@/components/stats/ViolenceGenderChart'
import StolenItemsChart from '@/components/stats/StolenItemsChart'

export default function PaginaEstadisticas() {
    const router = useRouter()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports')
                const data = await res.json()
                setReports(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error en sincronización de datos de seguridad:", error)
                setReports([])
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const safeReports = Array.isArray(reports) ? reports : [];

    // --- PROCESAMIENTO TÉCNICO DE DATOS ---

    // 1. Objetos Sustraídos: Detección dinámica (ej. Mochilas, Celulares)
    const countsItems = safeReports.reduce((acc: Record<string, number>, curr: any) => {
        const item = curr.stolenObject || 'Otros';
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
    const dataItems = Object.keys(countsItems)
        .map(key => ({ name: key, value: countsItems[key] }))
        .sort((a, b) => b.value - a.value);

    // 2. Frecuencia por Distrito (Iquitos, Loreto)
    const districtsList = ['Iquitos', 'Punchana', 'San Juan', 'Belén'];
    const dataDistricts = districtsList.map(d => ({
        name: d,
        cantidad: safeReports.filter((r: any) => r.district === d).length
    }));

    // 3. Distribución Horaria
    const momentos = ['Mañana', 'Tarde', 'Noche', 'Madrugada'];
    const dataTime = momentos.map(m => ({
        name: m,
        value: safeReports.filter((r: any) => r.timeOfDay === m).length
    }));

    // 4. Matriz de Violencia por Género (Actualizado para incluir 'Otros')
    const dataViolence = ['Hombre', 'Mujer', 'Otro'].map(g => ({
        genero: g,
        'Con violencia': safeReports.filter((r: any) => r.victimGender === g && r.incidentType === 'Con violencia o amenaza').length,
        'Sin violencia': safeReports.filter((r: any) => r.victimGender === g && r.incidentType === 'Sin violencia (no me di cuenta)').length,
        'Intento': safeReports.filter((r: any) => r.victimGender === g && r.incidentType === 'Intento').length,
    }));

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header de Ingeniería */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">
                            Sistema de Análisis Criminalístico
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 tracking-[0.3em] uppercase">
                            Mapa de Inseguridad Ciudadana • <span className="text-[#10B981]">Iquitos - Loreto</span>
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
                    >
                        ← Volver al Panel
                    </button>
                </div>

                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-[#13505B] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">
                            Sincronizando base de datos institucional...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Indicadores Clave de Riesgo (KPIs) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Incidentes Registrados</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-5xl font-black text-[#0F172A] tracking-tighter">{safeReports.length}</p>
                                        <div className="px-2 py-1 bg-emerald-50 rounded-lg flex items-center gap-1">
                                            <span className="text-emerald-600 text-[10px] font-black">↑ 5.2%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:flex h-12 w-20 items-end gap-1">
                                    <div className="bg-slate-100 w-full h-[40%] rounded-t-sm"></div>
                                    <div className="bg-slate-200 w-full h-[60%] rounded-t-sm"></div>
                                    <div className="bg-[#10B981] w-full h-[90%] rounded-t-sm"></div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Zona de Mayor Frecuencia</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-4xl font-black text-[#0F172A]">
                                        {dataDistricts.sort((a, b) => b.cantidad - a.cantidad)[0]?.name || '---'}
                                    </p>
                                    {/* Indicador Técnico de Alerta */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                                        <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Nivel Crítico</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visualización de Gráficos de Datos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <StolenItemsChart data={dataItems} total={safeReports.length} />
                            <DistrictChart data={dataDistricts} />
                            <TimeDistributionChart data={dataTime} />
                            <ViolenceGenderChart data={dataViolence} />
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}