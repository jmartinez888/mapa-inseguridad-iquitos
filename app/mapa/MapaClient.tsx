'use client'

import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'

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

export default function MapaClient() {
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<L.Map | null>(null);
    const heatLayerRef = useRef<L.Layer | null>(null);
    const [reportes, setReportes] = useState<[number, number, number][]>([]);
    
    const PERU_CENTER: [number, number] = [-9.1899, -75.0151];
    const ZOOM_GENERAL = 5.4;

    useEffect(() => {
        fetch('/api/reports')
            .then(res => {
                if (!res.ok) throw new Error("No se pudo obtener la información");
                return res.json();
            })
            .then((json: Report[]) => {
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
                        return [lat, lng, 1.0];
                    });
                setReportes(formattedPoints);
            })
            .catch(err => {
                console.error("Error al procesar la API de reportes:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || reportes.length === 0) return;

        let active = true;

        const inicializarCapaTermica = (mapaInstancia: L.Map) => {
            mapaInstancia.invalidateSize();

            const contenedor = mapaInstancia.getContainer();
            if (contenedor.clientHeight === 0 || contenedor.clientWidth === 0) {
                requestAnimationFrame(() => {
                    if (active) inicializarCapaTermica(mapaInstancia);
                });
                return;
            }

            import('leaflet.heat' as string).then(() => {
                if (!active || !mapaInstancia) return;

                if (heatLayerRef.current) {
                    mapaInstancia.removeLayer(heatLayerRef.current);
                }

                const globalObj = window as unknown as Record<string, Record<string, unknown>>;
                const leafletGlobal = globalObj['L'];

                if (leafletGlobal && typeof leafletGlobal.heatLayer === 'function') {
                    const crearCapaCalor = leafletGlobal.heatLayer as (
                        pts: [number, number, number][],
                        opciones: Record<string, unknown>
                    ) => L.Layer;

                    // Renderizado 100% seguro con altura garantizada mayor a cero
// Renderizado 100% seguro con altura garantizada mayor a cero
   // Renderizado 100% seguro con altura garantizada mayor a cero
heatLayerRef.current = crearCapaCalor(reportes, {
    radius: 20,          // Mantiene el tamaño fino y estético del punto
    blur: 18,            // Desenfoque equilibrado para el difuminado suave
    maxZoom: 18,         // 🔥 CRÍTICO: Elevado a 16 para que mantenga el color rojo intenso incluso al ver las calles de cerca
    minOpacity: 0.2,     // Un poquito más de fuerza inicial para el halo azul
    max: 0.2,            // 🔥 CRÍTICO: Bajado a 0.4 para que no necesite acumular 20 reportes en la misma esquina para teñirse de rojo
    gradient: {       
        0.3: '#0066ff',  // 1. Azul (borde sutil)
        0.7: '#ffff00',  // 2. Amarillo (transición)
        1.0: '#ff0000'   // 3. Rojo (núcleo intenso)
    }
}).addTo(mapaInstancia);
                }
                setLoading(false);
            }).catch((err) => {
                console.error("Error al inicializar el plugin térmico:", err);
                setLoading(false);
            });
        };

        const mapaActual = mapRef.current;

        if (mapaActual) {
            mapaActual.setView(PERU_CENTER, ZOOM_GENERAL);
            mapaActual.whenReady(() => {
                inicializarCapaTermica(mapaActual);
            });
        }

        return () => {
            active = false;
            if (heatLayerRef.current && mapRef.current) {
                try {
                    mapRef.current.removeLayer(heatLayerRef.current);
                } catch (e) {
                    // Desmontado silencioso
                }
            }
        };
    }, [reportes]);

    return (
        <div className="w-full h-full relative block">
            <MapContainer
                center={PERU_CENTER} 
                zoom={ZOOM_GENERAL} 
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomSnap={0.1}
                zoomDelta={0.5}
                ref={mapRef}
                style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
            </MapContainer>

            {/* INDICADOR DE CARGA FLOTANTE */}
            {loading && (
                <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                        Calculando mapa térmico...
                    </span>
                </div>
            )}
        </div>
    );
}