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

// --- CONFIGURACIÓN NACIONAL ---
const PERU_CENTER: [number, number] = [-9.19, -75.01]
const INITIAL_ZOOM = 4

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

// --- COMPONENTE PARA FORZAR VISTA (Solución al error useMap) ---
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap(); // Ahora sí está importado arriba
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng]
        setPosition(latlng)
        onLocationSelect(latlng[0], latlng[1])
      },
    })

    return position ? (
      <Marker position={position} icon={customIcon} />
    ) : null;
  }

  if (!isMounted) return null

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key="map-picker-nacional-peru"
        center={PERU_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
      >
        {/* FUERZA LA VISTA AL CARGAR EL FORMULARIO */}
        <ChangeView center={PERU_CENTER} zoom={INITIAL_ZOOM} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}