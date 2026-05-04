'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

// Cargamos el cliente del mapa sin SSR para evitar errores de Leaflet en el servidor
const MapaClient = dynamic(() => import('./MapaClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-[3rem] flex items-center justify-center">
      <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Cargando interfaz de mapa...
      </span>
    </div>
  )
})

export default function MapaPage() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-12">

      {/* CONTENEDOR DEL BOTÓN "VOLVER" */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-emerald-800 hover:text-emerald-600 transition-all group"
        >
          {/* Flecha estilizada similar a la imagen */}
          <span className="text-2xl font-light transform group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          <span className="text-sm font-black uppercase tracking-[0.2em]">
            Volver al formulario
          </span>
        </Link>
      </div>

      {/* CONTENEDOR DEL MAPA DE INSEGURIDAD - IQUITOS */}
      <div className="max-w-6xl mx-auto shadow-2xl rounded-[3.5rem] overflow-hidden border border-slate-100">
        <MapaClient />
      </div>

      {/* FOOTER OPCIONAL PARA MANTENER CONSISTENCIA */}
      <footer className="max-w-6xl mx-auto mt-10 text-center">
        <p className="text-[10px] text-emerald-900/40 uppercase tracking-widest font-black">
          Visualización de datos - Soil Plant Iquitos
        </p>
      </footer>

    </main>
  )
}