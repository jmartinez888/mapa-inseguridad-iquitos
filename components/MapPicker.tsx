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

// --- CONFIGURACIÓN BASE (PERÚ GENERAL POR SI EL GPS FALLA) ---
const PERU_CENTER: [number, number] = [-9.19, -75.01]
const ZOOM_INICIAL = 6 

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

// --- COMPONENTE PARA MOVER LA CÁMARA DEL MAPA ---
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (map && typeof map.setView === 'function' && center) {
      const timer = setTimeout(() => {
        try {
          map.setView(center, zoom);
          map.invalidateSize();
        } catch (err) {
          console.warn("Leaflet no estaba listo para reubicar la vista:", err);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [map, center, zoom]);

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

// --- COMPONENTE PRINCIPAL ---
export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  // Estado para el marcador (el pin azul)
  const [position, setPosition] = useState<[number, number] | null>(null)
  
  // Estados para controlar hacia dónde mira la cámara del mapa
  const [mapCenter, setMapCenter] = useState<[number, number]>(PERU_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(ZOOM_INICIAL)

  // DETECTAR LA UBICACIÓN REAL DEL USUARIO AL CARGAR (SOLO UNA VEZ)
  useEffect(() => {
    let tieneUbicacionInicial = false;

    if (typeof window !== 'undefined' && navigator.geolocation && !tieneUbicacionInicial) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (tieneUbicacionInicial) return;
          
          const { latitude, longitude } = pos.coords;
          
          setMapCenter([latitude, longitude]);
          setMapZoom(16);
          setPosition([latitude, longitude]);
          onLocationSelect(latitude, longitude);
          
          tieneUbicacionInicial = true;
        },
        (error) => {
          console.log("Permiso de GPS denegado o apagado. Mapa base activo.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: Infinity 
        }
      );
    }
  }, [onLocationSelect]);

  // Evita problemas de renderizado en el servidor (SSR)
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
        {/* Mueve la cámara automáticamente a donde esté el centro actual */}
        <ChangeView center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* PERMITE CAMBIAR EL PIN SI HACES CLIC EN OTRO LADO */}
        <ManejadorClics onClic={(lat, lng) => {
          setPosition([lat, lng]);    // Cambia el pin azul de sitio
          setMapCenter([lat, lng]);   // Mueve la cámara al punto cliqueado para evitar rebotes automáticos
          onLocationSelect(lat, lng); // Notifica el cambio al backend/formulario de app/page.tsx
        }} />

        {/* Si hay una posición seleccionada, dibuja el pin */}
        {position && (
          <Marker position={position} icon={customIcon} />
        )}
      </MapContainer>
    </div>
  );
}