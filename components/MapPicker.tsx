'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L, { type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 🔧 FIX ICONOS: Configuración manual para evitar errores de ruta en Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// 📍 Centro por defecto en Iquitos
const DEFAULT_CENTER: [number, number] = [-3.7491, -73.2538]

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // 🛡️ Evita que el mapa intente cargar en el servidor (SSR)
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

    return position ? <Marker position={position} icon={customIcon} /> : null
  }

  // No renderizar nada hasta que el componente esté montado en el navegador
  if (!isMounted) return null

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key="iquitos-security-map" // 🔑 Key única para forzar re-render limpio y evitar el error "container being reused"
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  )
}