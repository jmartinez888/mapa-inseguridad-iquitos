'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

// --- CONFIGURACIÓN DE ICONOS ---
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Icono personalizado para el usuario (Punto azul de ubicación)
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

// --- COMPONENTE DETECTOR DE UBICACIÓN AUTOMÁTICA ---
function LocationMarker() {
    const map = useMap();
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!map) return;

        // Dispara la detección automática de ubicación al cargar
        map.locate({ setView: false }); 

        // Cuando Leaflet encuentra con éxito la ubicación del usuario
        map.on('locationfound', (e) => {
            const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(coords);
            map.flyTo(coords, 16, { animate: true, duration: 1.5 }); // Hace un zoom 16 suave y directo al usuario
        });

        // Si el usuario deniega el permiso o falla el GPS, no rompe la app
        map.on('locationerror', () => {
            console.log("Permiso de ubicación denegado o GPS desactivado.");
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position} icon={userLocationIcon}>
            <Popup>
                <div className="text-center font-sans p-1 text-xs">
                    <p className="font-bold text-blue-600">📍 Tu ubicación actual</p>
                </div>
            </Popup>
        </Marker>
    );
}

// --- COMPONENTE DE CONTROL FULLSCREEN ---
function FullscreenControl() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const CustomFsControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: function () {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.innerHTML = '⛶'; 
                btn.title = 'Ver en Pantalla Completa';
                btn.style.backgroundColor = 'white';
                btn.style.width = '34px';
                btn.style.height = '34px';
                btn.style.fontSize = '18px';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = 'bold';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.border = '2px solid rgba(0,0,0,0.2)';
                btn.style.borderRadius = '4px';

                btn.onclick = function (e) {
                    e.preventDefault();
                    const container = map.getContainer();
                    if (!document.fullscreenElement) {
                        if (container.requestFullscreen) container.requestFullscreen();
                    } else {
                        if (document.exitFullscreen) document.exitFullscreen();
                    }
                };
                return btn;
            }
        });

        const fsControl = new CustomFsControl();
        map.addControl(fsControl);

        return () => {
            try { map.removeControl(fsControl); } catch (e) { }
        };
    }, [map]);

    return null;
}

// --- COMPONENTE PRINCIPAL ---
export default function MapaClient() {
    const [data, setData] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Centro por defecto en Iquitos por si no activan el GPS
    const DEFAULT_CENTER: [number, number] = [-3.749, -73.253];

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
                console.error("Error al cargar reportes en el mapa:", err);
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
                    center={DEFAULT_CENTER}
                    zoom={13} 
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    <FullscreenControl />
                    <LocationMarker />

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
                                                <p><strong>Objeto:</strong> {item.stolenObject}</p>
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