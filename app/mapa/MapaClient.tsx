'use client'

import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

interface Report {
    id: string;
    district: string;
    incidentType: string;
    stolenObject: string;
    latitude: number;
    lat?: number;
    lng?: number;
    longitude: number;
    timeOfDay: string;
}

// --- SUBCOMPONENTE DE CAPA DE CALOR (HEATMAP) ---
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
    const map = useMap();
    const heatLayerRef = useRef<L.Layer | null>(null);

    useEffect(() => {
        if (!map || typeof window === 'undefined') return;

        // Importamos el plugin dinámicamente en el cliente
        import('leaflet.heat' as string).then(() => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }

            // Solución limpia para satisfacer al linter estricto sin usar "any"
            const ventanaDesconocida = window as unknown;
            const contenedorGlobal = ventanaDesconocida as Record<string, unknown>;
            const claveLeaflet = 'L';
            const leafletGlobal = contenedorGlobal[claveLeaflet] as Record<string, unknown> | undefined;

            if (leafletGlobal && typeof leafletGlobal.heatLayer === 'function') {
                const crearCapaCalor = leafletGlobal.heatLayer as (
                    pts: [number, number, number][],
                    opciones: Record<string, unknown>
                ) => L.Layer;

                // 🎨 Capa térmica configurada con 3 colores de ALTO CONTRASTE
                heatLayerRef.current = crearCapaCalor(points, {
                    radius: 28,       // Radio de dispersión óptimo para distancias largas
                    blur: 20,         // Suaviza la fusión de las manchas térmicas
                    maxZoom: 17,      // Zoom límite de fusión
                    max: 1.0,         
                    gradient: {       
                        0.3: '#0066ff', // 1. Azul Eléctrico (Alta visibilidad en vista macro/Perú)
                        0.7: '#ffff00', // 2. Amarillo (Densidad media / Alerta)
                        1.0: '#ff0000'  // 3. Rojo Vivo (Focos críticos de delincuencia)
                    }
                }).addTo(map);
            }
        }).catch((err) => {
            console.error("Error al cargar la capa térmica en el cliente:", err);
        });

        return () => {
            if (heatLayerRef.current && map) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, points]);

    return null;
}

// --- SUBCOMPONENTE DE CÁMARA INICIAL ---
function ActualizadorCamara({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center && map) {
            map.setView(center, zoom);
            map.invalidateSize(); 
        }
    }, [center, zoom, map]);
    return null;
}

// --- COMPONENTE PRINCIPAL ---
export default function MapaClient() {
    const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
    const [loading, setLoading] = useState(true);
    
    // 🗺️ Configuración: El mapa inicia mostrando todo el Perú de forma general
    const PERU_CENTER: [number, number] = [-9.1899, -75.0151];
    const ZOOM_GENERAL = 5.4;

    useEffect(() => {
        fetch('/api/reports')
            .then(res => {
                if (!res.ok) throw new Error("No se pudo obtener la información");
                return res.json();
            })
            .then((json: Report[]) => {
                // Filtramos las coordenadas válidas de la Base de Datos
                const formattedPoints: [number, number, number][] = json
                    .filter((item) => {
                        const latitud = item.lat ?? item.latitude;
                        const longitud = item.lng ?? item.longitude;
                        return (
                            latitud !== undefined && 
                            longitud !== undefined && 
                            !isNaN(Number(latitud)) && 
                            !isNaN(Number(longitud))
                        );
                    })
                    .map((item) => {
                        const lat = Number(item.lat ?? item.latitude);
                        const lng = Number(item.lng ?? item.longitude);
                        // Estructura para leaflet.heat: [lat, lng, intensidad]
                        return [lat, lng, 1.0];
                    });

                setHeatPoints(formattedPoints);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar reportes para el mapa de calor:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-sans">
            {/* ENCABEZADO INFORMATIVO */}
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-black text-[#004d3d] tracking-tight leading-tight">
                    Mapa de Inseguridad Ciudadana del Perú
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                    Visualiza los reportes ciudadanos en tiempo real en las zonas más afectadas.
                </p>
            </div>

            {/* CONTENEDOR DEL MAPA */}
            <div className="h-[650px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 relative bg-slate-50">
                <MapContainer
                    center={PERU_CENTER} 
                    zoom={ZOOM_GENERAL} 
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomSnap={0.1}
                    zoomDelta={0.5}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Inyectamos la capa térmica si existen puntos cargados */}
                    {heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}

                    {/* Mantiene la cámara perfectamente posicionada en el inicio */}
                    <ActualizadorCamara center={PERU_CENTER} zoom={ZOOM_GENERAL} />
                </MapContainer>

                {/* INDICADOR DE CARGA */}
                {loading && (
                    <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                            Calculando mapa térmico...
                        </span>
                    </div>
                )}
            </div>

            <footer className="text-center pb-6">
                <p className="text-sm text-slate-400 font-medium italic">
                    Visualización analítica basada en reportes vecinales compartidos de forma anónima.
                </p>
            </footer>
        </div>
    );
}