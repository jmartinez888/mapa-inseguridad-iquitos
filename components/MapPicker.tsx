'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L, { type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Configuración de iconos para evitar errores de carga en Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER: [number, number] = [-3.7491, -73.2538]

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Aseguramos que el componente solo se cargue en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng]
        setPosition(latlng)
        onLocationSelect(latlng[0], latlng[1])
      },
    })

    // Pasamos las props de forma directa y limpia
    return position ? (
      <Marker position={position} icon={customIcon} />
    ) : null;
  }

  if (!isMounted) return null

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key="iquitos-security-map" // Key pasada directamente como prop
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}