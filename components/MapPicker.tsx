'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L, { type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// --- CONFIGURACIÓN DE ICONOS ---
const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : undefined;

// --- CONFIGURACIÓN NACIONAL PERÚ ---
const PERU_CENTER: [number, number] = [-9.19, -75.01]
const ZOOM_SOLICITADO = 6 

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

// --- COMPONENTE PARA FORZAR VISTA DINÁMICAMENTE ---
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }
  }, [center, zoom, map]);
  return null;
}

// --- MANEJADOR DE CLICS EN EL MAPA ---
function ManejadorClics({ onClic }: { onClic: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClic(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  
  // Estados de control para la cámara (Inicia en Perú general con zoom 6)
  const [mapCenter, setMapCenter] = useState<[number, number]>(PERU_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(ZOOM_SOLICITADO)

  useEffect(() => {
    // Intentar geolocalizar al usuario apenas cargue el componente en el cliente
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          console.log("📍 Ubicación para reporte detectada exitosamente:", userCoords);
          
          setMapCenter(userCoords);
          setMapZoom(14); // Cambia automáticamente a vista de calle/ciudad (ej. Iquitos)
          setPosition(userCoords);
          onLocationSelect(userCoords[0], userCoords[1]);
        },
        (error) => {
          console.log("Geolocalización no permitida o lenta. Manteniendo zoom panorámico 6 en Perú.");
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, [onLocationSelect])

  // Evita el renderizado en el servidor (SSR) de Next.js de manera limpia y sin estados extra
  if (typeof window === 'undefined') return null

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key="map-picker-nacional-peru"
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
      >
        {/* Controlador dinámico de la cámara */}
        <ChangeView center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Captura los clics en el mapa para mover el pin manualmente */}
        <ManejadorClics onClic={(lat, lng) => {
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }} />

        {/* Renderiza el pin azul del reporte si existe una posición válida */}
        {position && (
          <Marker position={position} icon={customIcon} />
        )}
      </MapContainer>
    </div>
  );
}