'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L, { type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

//iconos en Next.js
const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : undefined;

const DEFAULT_CENTER: [number, number] = [-3.7491, -73.2538]

type MapPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Limpieza al desmontar para evitar el error "Map container is being reused"
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

    // Pasamos las props de forma directa y limpia
    return position ? (
      <Marker position={position} icon={customIcon} />
    ) : null;
  }

  if (!isMounted) return null

  return (
    <div className="h-full w-full relative">
      <MapContainer
        key="map-container-iquitos"
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
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