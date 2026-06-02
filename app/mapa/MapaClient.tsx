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
    
    // Centro base de respaldo (Perú) por si la API viene vacía
    const PERU_CENTER: [number, number] = [-9.1899, -75.0151];
    const ZOOM_GENERAL = 5.4;

    // 1. Hook para consumir la API de reportes
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
                        return [lat, lng, 1.0]; // Peso inicial por defecto
                    });
                setReportes(formattedPoints);
            })
            .catch(err => {
                console.error("Error al procesar la API de reportes:", err);
                setLoading(false);
            });
    }, []);

    // 2. Hook para inicializar la capa térmica y realizar el auto-zoom
    useEffect(() => {
        if (typeof window === 'undefined' || reportes.length === 0) return;

        let active = true;

        const inicializarCapaTermica = (mapaInstancia: L.Map) => {
            // Forzamos al mapa a recalcular sus dimensiones físicas
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

                // Limpieza de capas duplicadas en el Canvas
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

                    // 🎨 TU CONFIGURACIÓN FAVORITA DE 3 COLORES PERFECTOS
                    heatLayerRef.current = crearCapaCalor(reportes, {
                        radius: 20,          // Mantiene el tamaño fino y estético del punto
                        blur: 18,            // Desenfoque equilibrado para el difuminado suave
                        maxZoom: 18,         // Mantiene el color rojo intenso incluso al ver las calles de cerca
                        minOpacity: 0.2,     // Un poquito más de fuerza inicial para el halo azul
                        max: 0.2,            // Bajado para que el núcleo se pinte de rojo al instante
                        gradient: {        
                            0.3: '#0066ff',  // 1. Azul (borde sutil)
                            0.7: '#ffff00',  // 2. Amarillo (transición)
                            1.0: '#ff0000'   // 3. Rojo (núcleo intenso)
                        }
                    }).addTo(mapaInstancia);

                    // 🚀 AUTO-ZOOM DINÁMICO: Encuadra la cámara directo en los puntos
                    if (reportes.length > 0) {
                        const coordenadas = reportes.map(r => [r[0], r[1]] as [number, number]);
                        mapaInstancia.fitBounds(coordenadas, {
                            padding: [50, 50], // Margen de seguridad para no cortar los halos en los bordes
                            maxZoom: 14        // Vista urbana ideal para calles de Iquitos sin sobre-acercarse
                        });
                    }
                }
                setLoading(false);
            }).catch((err) => {
                console.error("Error al inicializar el plugin térmico:", err);
                setLoading(false);
            });
        };

        const mapaActual = mapRef.current;

        if (mapaActual) {
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
                    // Desmontado controlado
                }
            }
        };
    }, [reportes]);

    return (
        // Se cambió a 'w-screen' y se quitaron remanentes de padding para blindar la vista móvil
        <div className="w-screen h-full min-h-full relative block p-0 m-0 overflow-hidden">
            <MapContainer
                center={PERU_CENTER} 
                zoom={ZOOM_GENERAL} 
                scrollWheelZoom={true}
                className="w-full h-full m-0 p-0"
                zoomSnap={0.1}
                zoomDelta={0.5}
                ref={mapRef}
                style={{ height: '100%', width: '100%', position: 'absolute', inset: 0, margin: 0, padding: 0 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
            </MapContainer>

            {/* INDICADOR DE CARGA FLOTANTE EN LA ESQUINA */}
            {loading && (
                <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                        Calculando mapa térmico....
                    </span>
                </div>
            )}
        </div>
    );
}