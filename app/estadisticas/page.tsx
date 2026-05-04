'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EstadisticasSeguridad from './EstadisticasSeguridad'

export default function PaginaEstadisticas() {
    const router = useRouter()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports')
                const data = await res.json()
                setReports(data)
            } catch (error) {
                console.error("Error al cargar estadísticas:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="min-h-screen bg-white p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Botón Volver - Estilo minimalista */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-emerald-800 font-black uppercase text-xs tracking-widest hover:text-emerald-600 transition-colors"
                >
                    ← Volver al formulario
                </button>

                {/* Encabezado - Sin fondo verde, solo texto color esmeralda */}
                <header className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-[#004d3d] tracking-tight leading-tight">
                        Análisis de Datos: Inseguridad en Iquitos 📊
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                        Visualización detallada de los reportes ciudadanos procesados en
                        <span className="text-[#007a5e] font-bold"> tiempo real</span>.
                    </p>
                </header>

                {/* Contenedor del Gráfico */}
                {loading ? (
                    <div className="bg-slate-50 p-20 rounded-[2.5rem] text-center font-bold text-emerald-900/40 animate-pulse border border-slate-100">
                        Sincronizando datos de Iquitos...
                    </div>
                ) : (
                    <div className="shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <EstadisticasSeguridad reports={reports} />
                    </div>
                )}

                <footer className="text-center pb-10">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        Iniciativa de Soil Plant Iquitos
                    </p>
                </footer>
            </div>
        </div>
    )
}