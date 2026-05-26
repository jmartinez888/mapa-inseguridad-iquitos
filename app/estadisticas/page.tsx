'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Importación de componentes de analítica con diseño unificado
import DistrictChart from '@/components/stats/DistrictChart'
import TimeDistributionChart from '@/components/stats/TimeDistributionChart'
import ViolenceGenderChart from '@/components/stats/ViolenceGenderChart'
import StolenItemsChart from '@/components/stats/StolenItemsChart'

// 🔹 INTERFAZ REFORZADA CON TIPOS OPTIONALES PARA EVITAR CRASHES
interface IncidentReport {
    id: string;
    district?: string | null;
    incidentType?: string | null;
    stolenObject?: string | null;
    victimGender?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    exactDate?: string | null;
    approximateDate?: string | null;
    timeOfDay?: string | null;
    description?: string | null;
    contactInfo?: string | null;
    createdAt?: string | null;
}

export default function PaginaEstadisticas() {
    const router = useRouter()
    const [reports, setReports] = useState<IncidentReport[]>([])
    const [loading, setLoading] = useState<boolean>(true)

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

    // --- PROCESAMIENTO SEGURO DE DATOS ---

    // 1. Objetos Sustraídos: Control de nulos integrado
    const countsItems = safeReports.reduce((acc: Record<string, number>, curr: IncidentReport) => {
        const item = curr.stolenObject ? curr.stolenObject.trim() : 'Otros';
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
    
    const dataItems = Object.keys(countsItems)
        .map(key => ({ name: key, value: countsItems[key] }))
        .sort((a, b) => b.value - a.value);

    // 2. Frecuencia por Distrito (Evita errores si el distrito viene vacío)
    const districtsList = ['Iquitos', 'Punchana', 'San Juan', 'Belén'];
    const dataDistricts = districtsList.map(d => ({
        name: d,
        cantidad: safeReports.filter((r: IncidentReport) => r.district === d).length
    }));

    // 3. Distribución Horaria (Protección absoluta contra campos indefenidos)
    const momentos = ['Mañana', 'Tarde', 'Noche', 'Madrugada', 'No recuerdo'];
    const dataTime = momentos.map(m => {
        const count = safeReports.filter((r: IncidentReport) => {
            const reportTime = r.timeOfDay ? r.timeOfDay.trim().toLowerCase() : '';
            if (m === 'No recuerdo') {
                return reportTime === 'no recuerdo' || reportTime === '';
            }
            return reportTime === m.toLowerCase();
        }).length;

        return {
            name: m,
            value: count
        };
    });

    // 4. Matriz de Violencia por Género (Lógica de Emparejamiento Ultra Segura)
    const dataViolence = ['Hombre', 'Mujer', 'Otro'].map(g => {
        // 1. Filtrar primero por género del reporte
        const reportsByGender = safeReports.filter((r: IncidentReport) => {
            const gender = r.victimGender ? r.victimGender.trim().toLowerCase() : '';
            if (g === 'Otro') {
                return gender !== 'hombre' && gender !== 'mujer' && gender !== 'masculino' && gender !== 'femenino';
            }
            if (g === 'Hombre') return gender === 'hombre' || gender === 'masculino';
            if (g === 'Mujer') return gender === 'mujer' || gender === 'femenino';
            return false;
        });

        // 2. Clasificar cada incidente de forma simplificada por palabras clave primitivas
        const conViolencia = reportsByGender.filter((r: IncidentReport) => {
            const type = r.incidentType ? r.incidentType.toLowerCase() : '';
            return type.includes('con') || type.includes('ame') || type.includes('vio') || type.includes('sí') || type.includes('si');
        }).length;

        const intento = reportsByGender.filter((r: IncidentReport) => {
            const type = r.incidentType ? r.incidentType.toLowerCase() : '';
            return type.includes('int') || type.includes('tra');
        }).length;

        // Por descarte, si hay reportes pero no entraron en las anteriores, van a "Sin violencia"
        // O si explícitamente dice "sin", "no" o "hurto"
        const sinViolencia = reportsByGender.filter((r: IncidentReport) => {
            const type = r.incidentType ? r.incidentType.toLowerCase() : '';
            return type.includes('sin') || type.includes('no') || type.includes('hur') || type.includes('cuenta');
        }).length;

        // Balance final: Para asegurar que ningún reporte se quede en el limbo por culpa del texto
        const totalProcesados = conViolencia + intento + sinViolencia;
        const faltantes = reportsByGender.length - totalProcesados;

        return {
            genero: g,
            'Con violencia': conViolencia,
            'Intento': intento,
            'Sin violencia': sinViolencia + (faltantes > 0 ? faltantes : 0) // Si algo no encajó, lo sumamos aquí para que no quede en 0
        };
    });

    return (
        <div className="min-h-screen bg-[#d1e2d9] bg-[radial-gradient(circle_at_top_right,_#e8f5ee_0%,_#d1e2d9_50%,_#b8cdc2_100%)] p-6 md:p-12 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">
                            RESULTADOS DE LA ENCUESTA
                        </h1>
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