'use client'


import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">Cargando mapa interactivo...</div>
})

export default function Home() {
  const router = useRouter()
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [incidentType, setIncidentType] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [timeOfDay, setTimeOfDay] = useState<string>('')
  const [mobility, setMobility] = useState<string>('')
  const [economicImpact, setEconomicImpact] = useState<string>('')

  const handleLocationSelect = async (la: number, lo: number) => {
    setLat(la);
    setLng(lo);

    try {
      // Llamada a la API de Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${lo}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const addr = data.address;
        const addressString = Object.values(addr)
          .join(' ')
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        // 1. DISTRITO
        const apiDistrict = addr.village || addr.suburb || addr.town || addr.city_district || addr.city;

        if (addressString.includes('punchana')) setSelectedDistrict('Punchana');
        else if (addressString.includes('belen')) setSelectedDistrict('Belén');
        else if (addressString.includes('san juan')) setSelectedDistrict('San Juan');
        else if (addressString.includes('iquitos')) setSelectedDistrict('Iquitos');
        else setSelectedDistrict(apiDistrict || 'Zona no identificada');

        // 2. PROVINCIA (Optimizado para Maynas y resto de Perú)
        let province = addr.county || addr.state_district;

        if (!province && (addressString.includes('iquitos') || addressString.includes('maynas'))) {
          province = 'Maynas';
        }

        setSelectedProvince(province || 'Provincia no detectada');

        // 3. DEPARTAMENTO
        setSelectedState(addr.state || addr.region || 'Departamento no detectado');
      }
    } catch (error) {
      // Este bloque es necesario para cerrar el try y manejar errores
      console.error("Error identificando la ubicación:", error);
      setSelectedDistrict('Error al detectar');
      setSelectedProvince('Error al detectar');
    }
  }; // <--- Ahora este cierre funcionará correctamente
  const handleReset = () => {
    setLat(null)
    setLng(null)
    setSelectedDistrict('') // ✅ Limpia el distrito al resetear
    setIncidentType('')
    setTimeOfDay('')
    setMobility('') // ✅ Limpiar movilidad
    setEconomicImpact('') // ✅ Limpiar impacto

    const form = document.querySelector('form') as HTMLFormElement
    if (form) form.reset()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget;

    if (!lat || !lng) {
      alert('📍 Por favor, marca el punto exacto en el mapa para continuar.')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(form)

    const reportData = {
      district: selectedDistrict,
      incidentType:
        formData.get('incidentType') === 'Otros'
          ? formData.get('incidentTypeOther')
          : formData.get('incidentType'),
      stolenObject: formData.get('item'),
      victimGender: formData.get('gender'),
      lat: lat,
      lng: lng,
      incidentYear: parseInt(formData.get('incidentYear') as string),
      incidentMonth: formData.get('incidentMonth') ? parseInt(formData.get('incidentMonth') as string) : null,
      incidentDay: formData.get('incidentDay') ? parseInt(formData.get('incidentDay') as string) : null,
      timeOfDay: formData.get('timeOfDay'),
      mobility: formData.get('mobility'), // ✅ Nuevo campo
      economicImpact: formData.get('economicImpact'), // ✅ Nuevo campo
      description: formData.get('description'),
      contactInfo: formData.get('contact'),
    };

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
        form.reset()
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
    <div className="min-h-screen bg-[#d1e2d9] bg-[radial-gradient(circle_at_top_right,_#e8f5ee_0%,_#d1e2d9_50%,_#b8cdc2_100%)] text-slate-900 pb-16 font-sans selection:bg-emerald-100">
      {/* HEADER PRINCIPAL */}
      {/* HEADER PRINCIPAL */}
      {/* HEADER PRINCIPAL */}

      <header className="p-8 md:p-14 mb-4 max-w-5xl mx-auto">

        <div className="max-w-3xl mx-auto space-y-16">

          <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-emerald-700 text-center block mb-7">

            Construyendo el mapa de inseguridad

            <br />

            ciudadana del Perú

            <br />

          </h1>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white/50 space-y-5 text-sm md:text-base leading-relaxed text-slate-700">
          <p className="text-justify">
            Este formulario permite reportar hechos de inseguridad ciudadana en <strong>todo el Perú</strong>.
            La información registrada es anónima y será utilizada con fines de análisis, <strong>visualización geográfica y publicación científica</strong>.
            Los reportes ayudarán a identificar patrones delictivos, zonas de riesgo y problemáticas recurrentes, contribuyendo a la generación de evidencia para la prevención y el fortalecimiento de la seguridad ciudadana.
            Tu participación es importante para construir un mapa colaborativo y actualizado de la inseguridad en el país.
          </p>

          <p className="font-bold text-emerald-700">
            Por favor comparte en todas tus redes sociales
          </p>

          <p className="text-justify">
            Se aceptan reportes desde el año 2000 hasta la actualidad (2026). El mapa será compartido para que llegue hasta ti.
          </p>

          {/* CUADRO INTERNO DE CONTACTO */}
          <div className="mt-6 space-y-3 text-sm md:text-base leading-relaxed text-slate-700">
            <strong>Esta iniciativa está desarrollada por: </strong>
            <a
              href="https://soilplantperu.com/"
              target="_blank"
              className="text-emerald-600 underline ml-2 font-bold hover:text-emerald-800"
            >
              Soil Plant
            </a>
            <span className="block font-semibold text-slate-800">
              Dudas:
              <strong className="ml-2 text-emerald-700">+51 987189611 / soilplant@soilplantperu.com</strong>
            </span>

            <span className="block text-xs text-slate-400 italic">
              Para cualquier duda o comentario, no dudes en comunicarte.
            </span>
          </div>
        </div>
      </header >

      <main className="px-6 space-y-10 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 1. UBICACIÓN */}
          <section className="space-y-6">
            <div className="flex items-center gap-5">
              <span className="bg-emerald-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">1</span>
              <h2 className="font-extrabold text-slate-800 text-2xl">¿Dónde ocurrió el hecho?</h2>
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-[380px] relative">
              <MapPicker onLocationSelect={handleLocationSelect} />
            </div>
          </section>
          {/* Debajo de la sección 1 (Mapa) o dentro de la sección 2 */}
          {(selectedDistrict || selectedProvince) && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl mb-6 animate-in fade-in slide-in-from-left-2">
              <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Ubicación Detectada:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p className="text-sm"><strong>Distrito:</strong> {selectedDistrict || 'No detectado'}</p>
                <p className="text-sm"><strong>Provincia:</strong> {selectedProvince}</p>
                <p className="text-sm"><strong>Departamento:</strong> {selectedState}</p>
              </div>
            </div>
          )}

          {/* 2. DETALLES DEL INCIDENTE */}

          {/* El encabezado ahora está fuera de la caja, igual que el punto 1 */}
          <div className="flex items-center gap-5">
            <span className="bg-emerald-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">2</span>
            <h2 className="font-extrabold text-slate-800 text-2xl tracking-tight">Detalles del Incidente</h2>
          </div>
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-emerald-50 space-y-8">


            {/* TIPO DE HECHO */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">
                ¿Qué tipo de hecho de inseguridad ocurrió? [Obligado]
              </label>
              <div className="space-y-2">
                {[
                  'Robo con violencia o amenaza',
                  'Hurto (sin que me diera cuenta)',
                  'Extorsión o amenaza',
                  'Secuestro',
                  'Estafa o fraude',
                  'Acoso u ofensa sexual',
                  'Maltrato físico o psicológico',
                  'Intento (no se consumó el hecho)',
                  'Otro'
                ].map((t) => (
                  <label key={t} className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${incidentType === t ? 'bg-emerald-100 border-emerald-500' : 'bg-emerald-50/30 border-emerald-100'}`}>
                    <input
                      type="radio"
                      name="incidentType"
                      value={t}
                      required
                      onChange={() => setIncidentType(t)}
                      checked={incidentType === t}
                      className="w-4 h-4 accent-emerald-700"
                    />
                    <span className={`text-sm font-bold ${incidentType === t ? 'text-emerald-900' : 'text-slate-600'}`}>{t}</span>
                  </label>
                ))}

                {/* Campo dinámico para "Otro" */}
                {incidentType === 'Otro' && (
                  <input
                    name="incidentTypeOther"
                    placeholder="Especifica el tipo de incidente"
                    className="w-full border-b-2 border-emerald-600 py-3 text-base outline-none bg-transparent animate-in fade-in slide-in-from-top-1"
                    required
                  />
                )}
              </div>
            </div>

            {/* OBJETO ROBADO - Se muestra solo si es Robo o Hurto */}
            {(incidentType === 'Robo con violencia o amenaza' || incidentType === 'Hurto (sin que me diera cuenta)') && (
              <div className="space-y-3 animate-in zoom-in-95 duration-300">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">
                  ¿Qué objeto le robaron o hurtaron? *
                </label>
                <input
                  name="item"
                  placeholder="Ej: Celular Samsung, Motocicleta Honda, Billetera"
                  required
                  className="w-full border-b-2 border-slate-300 py-3 text-base outline-none focus:border-emerald-600 bg-transparent transition-all"
                />
              </div>
            )}

            {/* SEXO DE LA VÍCTIMA */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Sexo de la víctima [Obligado] </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Hombre', 'Mujer', 'Prefiero no decirlo'].map((s) => (
                  <label key={s} className="flex items-center gap-3 p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl cursor-pointer">
                    <input type="radio" name="gender" value={s} required className="w-4 h-4 accent-emerald-700" />
                    <span className="text-xs font-bold text-slate-600">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SECCIÓN DE FECHA UNIFICADA */}
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide block">

                ¿Cuándo ocurrió? [Opcional] Si no recuerdas la fecha exacta, indica el mes o año

              </label>

              <div className="flex flex-col md:flex-row gap-4">
                {/* AÑO - OBLIGATORIO */}
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Año *</span>
                  <select
                    name="incidentYear"
                    required
                    className="w-full border-b-2 border-slate-300 py-2 outline-none focus:border-emerald-600 bg-transparent transition-colors appearance-none cursor-pointer font-medium"
                  >
                    <option value="">Selecciona el año</option>
                    {Array.from({ length: 27 }, (_, i) => 2026 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* MES - OPCIONAL */}
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mes (Opcional)</span>
                  <select
                    name="incidentMonth"
                    className="w-full border-b-2 border-slate-300 py-2 outline-none focus:border-emerald-600 bg-transparent transition-colors appearance-none cursor-pointer font-medium"
                  >
                    <option value="">No recuerdo el mes</option>
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, idx) => (
                      <option key={mes} value={idx + 1}>{mes}</option>
                    ))}
                  </select>
                </div>

                {/* DÍA - OPCIONAL */}
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Día (Opcional)</span>
                  <select
                    name="incidentDay"
                    className="w-full border-b-2 border-slate-300 py-2 outline-none focus:border-emerald-600 bg-transparent transition-colors appearance-none cursor-pointer font-medium"
                  >
                    <option value="">No recuerdo el día</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Solo el año es indispensable para el estudio científico.
              </p>
            </div>
            {/* MOMENTO DEL DÍA */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">
                ¿En qué momento del día ocurrió? [Obligado]
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Mañana', 'Tarde', 'Noche', 'Madrugada', 'No recuerdo'].map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${timeOfDay === m ? 'bg-emerald-100 border-emerald-500 shadow-sm' : 'bg-emerald-50/30 border-emerald-100'}`}
                  >
                    <input
                      type="radio"
                      name="timeOfDay"
                      value={m}
                      required
                      checked={timeOfDay === m}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-4 h-4 accent-emerald-700"
                    />
                    <span className={`text-xs font-bold ${timeOfDay === m ? 'text-emerald-900' : 'text-slate-600'}`}>
                      {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* 3. MOVILIDAD Y IMPACTO ECONÓMICO */}
            <div className="space-y-8">
              {/* MOVILIDAD */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">
                  ¿Cómo se movilizaba cuando ocurrió el hecho? [Obligado]
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'A pie',
                    'En mototaxi',
                    'En moto propia',
                    'En auto propio',
                    'En transporte público (bus, combi)',
                    'En taxi / aplicativo',
                    'No recuerdo'
                  ].map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${mobility === m
                        ? 'bg-emerald-100 border-emerald-500 shadow-sm'
                        : 'bg-emerald-50/30 border-emerald-100'
                        }`}
                    >
                      <input
                        type="radio"
                        name="mobility"
                        value={m}
                        required
                        checked={mobility === m}
                        onChange={(e) => setMobility(e.target.value)} // ✅ Ahora sí está definido
                        className="w-4 h-4 accent-emerald-700"
                      />
                      <span className={`text-sm font-bold ${mobility === m ? 'text-emerald-900' : 'text-slate-600'}`}>
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* IMPACTO ECONÓMICO */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">
                  ¿Cuál fue el impacto económico aproximado? [Obligado]
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Menos de S/ 100',
                    'Entre S/ 100 y S/ 500',
                    'Entre S/ 500 y S/ 2,000',
                    'Más de S/ 2,000',
                    'No hubo pérdida económica',
                    'No recuerdo'
                  ].map((i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${economicImpact === i
                        ? 'bg-emerald-100 border-emerald-500 shadow-sm'
                        : 'bg-emerald-50/30 border-emerald-100'
                        }`}
                    >
                      <input
                        type="radio"
                        name="economicImpact"
                        value={i}
                        required
                        checked={economicImpact === i}
                        onChange={(e) => setEconomicImpact(e.target.value)} // ✅ Ahora sí está definido
                        className="w-4 h-4 accent-emerald-700"
                      />
                      <span className={`text-sm font-bold ${economicImpact === i ? 'text-emerald-900' : 'text-slate-600'}`}>
                        {i}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* EXTRAS */}
            <div className="space-y-6 pt-6 border-emerald-50">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Descripción breve del hecho (opcional)</label>
                <input name="description" placeholder="Detalles adicionales..." className="w-full border-b-2 border-slate-300 py-3 text-base outline-none focus:border-emerald-600 bg-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Si quieres recibir los resultados de esta investigación, indícanos cómo contactarte [Opcional]</label>
                <input name="contact" placeholder="Email o Teléfono" className="w-full border-b-2 border-slate-300 py-3 text-base outline-none focus:border-emerald-600 bg-transparent" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-700 text-white py-5 rounded-[2rem] text-lg font-black shadow-xl hover:bg-emerald-800 transition-all active:scale-95 disabled:bg-slate-300 mt-6"
            >
              {isSubmitting ? 'GUARDANDO REPORTE...' : 'REGISTRAR MI REPORTE ANÓNIMO'}
            </button>
            <button
              type="button"
              onClick={() => {
                handleReset();
                setTimeOfDay(''); // ✅ Limpia el estado visual
                setIncidentType(''); // ✅ Limpia el estado visual
              }}
              className="w-full bg-slate-200 text-slate-700 py-5 rounded-[2rem] text-lg font-black shadow hover:bg-slate-300 transition-all active:scale-95"
            >
              BORRAR FORMULARIO
            </button>
          </section>
        </form>

        {/* NAVEGACIÓN */}
        <footer className="pt-10 border-emerald-100 text-center space-y-10">
          {/* RESULTADOS */}
          <div className="pt-10 border-t border-emerald-100 space-y-6">
            <h2 className="text-center text-xl font-extrabold text-slate-800 tracking-tight">
              RESULTADOS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                type='button'
                onClick={() => window.open('https://bit.ly/mapa-inseguridad-iquitos', '_blank')}
                className="flex flex-col items-center gap-2 p-6 bg-white rounded-[2rem] border-2 border-emerald-50 hover:border-emerald-500 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🗺️</span>
                <span className="text-[14px] font-black uppercase tracking-widest text-emerald-900">
                  Ver Mapa
                </span>
              </button>

              <button
                onClick={() => router.push('/estadisticas')}
                className="flex flex-col items-center gap-2 p-6 bg-white rounded-[2rem] border-2 border-emerald-50 hover:border-emerald-500 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[14px] font-black uppercase tracking-widest text-emerald-900">
                  Ver Estadísticas
                </span>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div >
  )
}