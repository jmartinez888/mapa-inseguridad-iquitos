'use client'

import { useEffect, useState } from 'react'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'


// --- CONFIGURACIÓN DE ICONOS (Fix para Next.js) ---
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
    longitude: number;
    timeOfDay: string;
}

// --- COMPONENTE DE CONTROL FULLSCREEN (SIN ERRORES) ---
function FullscreenControl() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Definimos la función de toggle manualmente para evitar errores de plugin
        // @ts-ignore
        map.toggleFullscreen = function () {
            const container = map.getContainer();
            if (!document.fullscreenElement) {
                if (container.requestFullscreen) container.requestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        };

        // Creamos un botón de control personalizado estilo Leaflet
        const CustomFsControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: function () {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.innerHTML = '⛶'; // Icono de pantalla completa
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
                    // @ts-ignore
                    map.toggleFullscreen();
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
    const CENTER: LatLngExpression = [-9.19, -75.01]; // Centro: Iquitos

    useEffect(() => {
        // Sincronización con la API de Neon (Ruta en plural)
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
                    Mapa de Inseguridad Ciudadana en Iquitos y Distritos Metropolitanos
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                    Visualiza los reportes ciudadanos en tiempo real para
                    <span className="text-[#007a5e] font-bold"> Iquitos, San Juan, Belén y Punchana</span>.
                </p>
            </div>

            {/* CONTENEDOR DEL MAPA */}
            <div className="h-[650px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 relative bg-slate-50">
                <MapContainer
                    {...({
                        center: CENTER,
                        zoom: 6,
                        scrollWheelZoom: true,
                        className: "h-full w-full"
                    } as any)}
                >
                    <TileLayer
                        {...({
                            url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        } as any)}
                    />

                    <FullscreenControl />

                    {data.map((item) => (
                        <Marker
                            key={item.id}
                            {...({
                                position: [item.latitude, item.longitude],
                                icon: customIcon
                            } as any)}
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
                    ))}
                </MapContainer>

                {/* INDICADOR DE CARGA */}
                {loading && (
                    <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                            Sincronizando reportes nacionales...
                        </span>
                    </div>
                )}
            </div>

            <footer className="text-center pb-6">
                <p className="text-sm text-slate-400 font-medium italic">
                    "La seguridad la construimos todos compartiendo información veraz."
                </p>
            </footer>
        </div>
    );
}