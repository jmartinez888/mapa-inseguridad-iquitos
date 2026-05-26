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

const userLocationIcon = new L.DivIcon({
    html: `<div style="
        background-color: #2563eb; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 0 8px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
    "></div>
    <style>
        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
    </style>`,
    className: 'custom-user-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
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

// 🔹 SUBCOMPONENTE REALTOR DE CÁMARA (Fuerza al mapa a moverse de verdad)
function ActualizadorCamara({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
            map.invalidateSize(); // Previene cuadros grises o congelamientos
        }
    }, [center, zoom, map]);
    return null;
}

export default function MapaClient() {
    const [data, setData] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Punto de partida: Vista panorámica de Perú en zoom 6
    const RESPALDO_PERU: [number, number] = [-9.1899, -75.0151];
    const [mapCenter, setMapCenter] = useState<[number, number]>(RESPALDO_PERU);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

    // 1. Cargar datos de los reportes
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

    // 2. Localizar al usuario inmediatamente usando configuraciones más permisivas
    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    console.log("📍 Ubicación encontrada con éxito:", coords);
                    setUserPosition(coords);
                    setMapCenter(coords);
                    setMapZoom(14); // Cambia el zoom a vista de ciudad en cuanto responde
                },
                (error) => {
                    console.error("❌ Error de Geolocalización:", error.message);
                    // Si falla, intentamos una segunda búsqueda rápida sin alta precisión (para PCs de escritorio)
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                            setUserPosition(coords);
                            setMapCenter(coords);
                            setMapZoom(14);
                        },
                        (err2) => {
                            console.log("No se pudo obtener ubicación con ningún método. Quedando en Perú general.");
                        },
                        { enableHighAccuracy: false, timeout: 10000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
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
                    center={mapCenter} 
                    zoom={mapZoom} 
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Punto azul de tu posición actual */}
                    {userPosition && (
                        <Marker position={userPosition} icon={userLocationIcon}>
                            <Popup>
                                <div className="text-center font-sans p-1 text-xs">
                                    <p className="font-bold text-blue-600">📍 Tu ubicación actual</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Renderizado de pines guardados en la BD */}
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

                    {/* 🔹 ESTE COMPONENTE OBLIGA AL MAPA A MOVERSE CUANDO CAMBIA EL ESTADO */}
                    <ActualizadorCamara center={mapCenter} zoom={mapZoom} />

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