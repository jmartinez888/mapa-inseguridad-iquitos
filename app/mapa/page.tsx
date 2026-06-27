'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

// Cargamos el cliente del mapa sin SSR para evitar errores de Leaflet en el servidor
const MapaClient = dynamic(() => import('./MapaClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-slate-100 animate-pulse flex items-center justify-center">
      <span className="text-slate-400 font-black uppercase tracking-widest text-xs">
        Cargando interfaz de mapa térmico...
      </span>
    </div>
  )
})

export default function MapaPage() {
  return (
    <main className="w-full h-screen bg-slate-50 flex flex-col m-0 p-0 overflow-hidden">
      
      {/* SECCIÓN SUPERIOR DE NAVEGACIÓN Y TÍTULO UNIFICADO */}
      <div className="w-full bg-white px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm z-[999] shrink-0">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 transition-all group shrink-0"
          >
            <span className="text-xl font-light transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="text-xs font-black uppercase tracking-[0.15em]">
              Volver
            </span>
          </Link>
          
          <div className="hidden md:block w-px h-6 bg-slate-200" />
          
          <div>
            <h1 className="text-lg md:text-xl font-black text-[#004d3d] tracking-tight leading-none">
              Mapa de Inseguridad Ciudadana
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualización analítica en tiempo real basada en reportes vecinales.
            </p>
          </div>
        </div>      
        
      </div>

      {/* CONTENEDOR DEL MAPA EXPANDIBLE REAL AL 100% DEL ESPACIO RESTANTE */}
      <div className="flex-1 w-full relative block">
        <MapaClient />
      </div>

    </main>
  )
}