'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">Cargando mapa interactivo...</div>
})

export default function Home() {
  const router = useRouter()
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Referencia fija al formulario para evitar el error de 'null' en el reset
    const form = e.currentTarget;

    if (!lat || !lng) {
      alert('📍 Por favor, marca el punto exacto en el mapa para continuar.')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(form)

    const reportData = {
      district: formData.get('district'),
      incidentType: formData.get('incidentType'),
      stolenObject: formData.get('item'),
      victimGender: formData.get('gender'),
      lat: lat,
      lng: lng,
      exactDate: formData.get('date'),
      approximateDate: formData.get('dateHint'),
      timeOfDay: formData.get('timeOfDay'),
      description: formData.get('description'),
      contactInfo: formData.get('contact'),
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      const result = await response.json()

      if (result.ok) {
        alert('✅ Reporte registrado exitosamente en la base de datos.')
        setLat(null)
        setLng(null)
        form.reset() // Uso de la referencia guardada
      } else {
        alert('❌ Error al guardar: ' + (result.error || 'Inténtalo de nuevo.'))
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      alert('❌ Error de red: No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 text-slate-900 pb-16 font-sans selection:bg-emerald-100">

      {/* HEADER PRINCIPAL MODIFICADO */}
      <header className="p-8 md:p-14 mb-4 max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Cambiamos text-white por text-slate-900 para que se vea en el fondo claro */}
          <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-emerald-700">
            Construyendo el mapa de inseguridad ciudadana – Iquitos (Punchana, San Juan, Belén e Iquitos)
          </h1>

          {/* Cambiamos el fondo blanco/10 por un gris muy suave o transparente */}
          <div className="bg-slate-100/50 backdrop-blur-sm p-6 md:p-8 rounded-[2.5rem] border border-slate-200 space-y-5 text-sm md:text-base leading-relaxed text-slate-700">
            <p>
              Este formulario permite reportar hechos de inseguridad ciudadana en los distritos de
              <strong> Iquitos, San Juan Bautista, Belén y Punchana</strong>.
              La información registrada es anónima y será utilizada con fines de análisis y publicación científica.
            </p>

            {/* Cambiamos el color esmeralda claro por uno más oscuro para contraste */}
            <p className="text-lg md:text-xl font-bold italic text-emerald-700">
              Ayúdanos a mejorar la seguridad en nuestra ciudad creando un mapa de riesgo compartido.
            </p>

            <div className="pt-4 space-y-4 border-t border-slate-200 text-[13px] md:text-sm">
              <p>
                Se aceptan reportes desde el año 2000 hasta la actualidad (2026). Finalmente el mapa sera compartido para que llegue hasta ti. Pero si quieres ver como va quedando el mapa puedes ver aqui:
                <a href="https://lookerstudio.google.com/reporting/118f92d8-16b9-4996-bd5a-1b7952b5d988" target="_blank" className="text-emerald-600 underline break-all ml-1 font-semibold hover:text-emerald-800">
                  Resultados en Looker Studio
                </a>
              </p>

              <p className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                Esta iniciativa está desarrollada por:
                <a href="https://soilplantperu.com/" target="_blank" className="text-emerald-600 underline break-all ml-1 font-semibold hover:text-emerald-800">
                  Soil Plant
                </a>
                Si tienes dudas me puedes contactar <strong>+51 987189611 📱</strong>.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="px-6 space-y-10 max-w-2xl mx-auto">

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 1. UBICACIÓN */}
          <section className="space-y-6">
            <div className="flex items-center gap-5">
              <span className="bg-emerald-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">1</span>
              <h2 className="font-extrabold text-slate-800 text-2xl">¿Dónde ocurrió el hecho?</h2>
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-[380px] relative">
              <MapPicker onLocationSelect={(la, lo) => { setLat(la); setLng(lo); }} />
            </div>
          </section>

          {/* 2. DETALLES DEL INCIDENTE */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-emerald-50 space-y-8">
            <div className="flex items-center gap-5 mb-4 border-b border-emerald-50 pb-6">
              <span className="bg-emerald-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">2</span>
              <h2 className="font-extrabold text-slate-800 text-2xl tracking-tight">Detalles del Incidente</h2>
            </div>

            {/* DISTRITO */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Distrito *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Iquitos', 'Punchana', 'San Juan', 'Belén'].map((d) => (
                  <label key={d} className="flex items-center gap-3 p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input type="radio" name="district" value={d} required className="w-4 h-4 accent-emerald-700" />
                    <span className="text-sm font-bold text-slate-600">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* TIPO DE HECHO */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Tipo de incidente *</label>
              <div className="space-y-2">
                {['Con violencia o amenaza', 'Sin violencia (no me di cuenta)', 'Intento'].map((t) => (
                  <label key={t} className="flex items-center gap-3 p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl cursor-pointer">
                    <input type="radio" name="incidentType" value={t} required className="w-4 h-4 accent-emerald-700" />
                    <span className="text-sm font-bold text-slate-600">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* OBJETO ROBADO */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Objeto sustraído (Celular, moto, etc.) *</label>
              <input name="item" placeholder="Ej: Celular Samsung" required className="w-full border-b-2 border-emerald-100 py-3 text-base outline-none focus:border-emerald-600 bg-transparent transition-all" />
            </div>

            {/* SEXO DE LA VÍCTIMA */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Sexo de la víctima *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Hombre', 'Mujer', 'Otro'].map((s) => (
                  <label key={s} className="flex items-center gap-3 p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl cursor-pointer">
                    <input type="radio" name="gender" value={s} required className="w-4 h-4 accent-emerald-700" />
                    <span className="text-xs font-bold text-slate-600">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* FECHA Y MOMENTO */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Fecha aproximada</label>
                <input type="date" name="date" className="w-full md:w-1/2 border-b-2 border-emerald-100 py-2 outline-none focus:border-emerald-600 bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Aclaración de fecha (opcional)</label>
                <textarea name="dateHint" placeholder="Si no recuerda la fecha exacta, indique mes o año." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" rows={2} />
              </div>
            </div>

            {/* MOMENTO DEL DÍA */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Momento del día *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Mañana', 'Tarde', 'Noche', 'Madrugada'].map((m) => (
                  <label key={m} className="flex items-center gap-3 p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl cursor-pointer">
                    <input type="radio" name="timeOfDay" value={m} required className="w-4 h-4 accent-emerald-700" />
                    <span className="text-xs font-bold text-slate-600">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* EXTRAS */}
            <div className="space-y-6 pt-6 border-t border-emerald-50">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Descripción del hecho</label>
                <textarea name="description" placeholder="Detalles adicionales..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Tu contacto para enviarte resultados (opcional)</label>
                <input name="contact" placeholder="Email o Teléfono" className="w-full border-b-2 border-emerald-100 py-3 text-base outline-none focus:border-emerald-600 bg-transparent" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-700 text-white py-5 rounded-[2rem] text-lg font-black shadow-xl hover:bg-emerald-800 transition-all active:scale-95 disabled:bg-slate-300 mt-6"
            >
              {isSubmitting ? 'GUARDANDO REPORTE...' : 'REGISTRAR MI REPORTE ANÓNIMO'}
            </button>
          </section>
        </form>

        {/* NAVEGACIÓN */}
        <footer className="pt-10 border-t border-emerald-100 text-center space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button onClick={() => router.push('/mapa')} className="flex flex-col items-center gap-2 p-6 bg-white rounded-[2rem] border-2 border-emerald-50 hover:border-emerald-500 transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🗺️</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Ver Mapa</span>
            </button>
            <button onClick={() => router.push('/estadisticas')} className="flex flex-col items-center gap-2 p-6 bg-white rounded-[2rem] border-2 border-emerald-50 hover:border-emerald-500 transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Ver Estadísticas</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}