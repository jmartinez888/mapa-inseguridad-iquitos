'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

// --- CONFIGURACIÓN DE ICONOS NATIVOS ---
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

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

// 🔹 SUBCOMPONENTE DE CÁMARA
function ActualizadorCamara({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
            map.invalidateSize(); 
        }
    }, [center, zoom, map]);
    return null;
}

export default function MapaClient() {
    const [data, setData] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Coordenadas fijas: Centro del Perú y Zoom Intermedio óptimo
    const PERU_CENTER: [number, number] = [-9.1899, -75.0151];
    
    // 💡 PROBABLEMENTE TU ZOOM IDEAL SEA 5.4 o 5.5
    const ZOOM_GENERAL = 5.4;

    // 1. Cargar datos de los reportes desde la base de datos
    useEffect(() => {
        fetch('/api/reports')
            .then(res => {
                if (!res.ok) throw new Error("No se pudo obtener la información");
                return res.json();
            })
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar reportes:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-sans">
            {/* ENCABEZADO INFORMATIVO */}
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-black text-[#004d3d] tracking-tight leading-tight">
                    Mapa de Inseguridad Ciudadana
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                    Visualiza los reportes ciudadanos en tiempo real en las zonas afectadas.
                </p>
            </div>

            {/* CONTENEDOR DEL MAPA */}
            <div className="h-[650px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 relative bg-slate-50">
                <MapContainer
                    center={PERU_CENTER} 
                    zoom={ZOOM_GENERAL} 
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    // 💡 ESTAS PROPIEDADES PERMITEN EL ZOOM DECIMAL
                    zoomSnap={0.1}
                    zoomDelta={0.5}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Renderizado de los pines delictivos guardados en la BD */}
                    {data
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
                            const latitudFinal = Number(item.lat ?? item.latitude);
                            const longitudFinal = Number(item.lng ?? item.longitude);
                            const posicionFinal: [number, number] = [latitudFinal, longitudFinal];

                            return (
                                <Marker
                                    key={item.id}
                                    position={posicionFinal}
                                    icon={customIcon}
                                >
                                    <Popup>
                                        <div className="min-w-[180px] p-2">
                                            <h3 className="font-bold text-red-600 border-b border-red-50 mb-2 pb-1 text-sm uppercase">
                                                🚨 {item.incidentType}
                                            </h3>
                                            <div className="space-y-1.5 text-[11px] text-slate-700">
                                                <p><strong>Objeto:</strong> {item.stolenObject || 'No especificado'}</p>
                                                <p><strong>Horario:</strong> {item.timeOfDay}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">
                                                    Distrito: {item.district}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ); 
                        }) 
                    }

                    {/* Asegura que la cámara se mantenga perfectamente centrada en el país */}
                    <ActualizadorCamara center={PERU_CENTER} zoom={ZOOM_GENERAL} />

                </MapContainer>

                {/* INDICADOR DE CARGA */}
                {loading && (
                    <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                            Sincronizando reportes...
                        </span>
                    </div>
                )}
            </div>

            <footer className="text-center pb-6">
                <p className="text-sm text-slate-400 font-medium italic">
                    La seguridad la construimos todos compartiendo información veraz.
                </p>
            </footer>
        </div>
    );
}