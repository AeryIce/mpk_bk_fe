'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaiki icon default Leaflet di Next
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  lat: number | null;
  lng: number | null;
  onPointChange?: (lat: number, lng: number) => void;
  height?: number | string;
};

function ClickCatcher({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPickerInner({ lat, lng, onPointChange, height = 340 }: Props) {
  const [pos, setPos] = useState<[number, number] | null>(
    lat != null && lng != null ? [lat, lng] : null,
  );

  useEffect(() => {
    if (lat != null && lng != null) setPos([lat, lng]);
  }, [lat, lng]);

  const center: LatLngExpression = useMemo(() => pos ?? [-6.2, 106.816666], [pos]); // Jakarta default

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-neutral-200">
      <MapContainer
        center={center}
        zoom={pos ? 16 : 12}
        style={{ height }}
        scrollWheelZoom
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher
          onClick={(la, ln) => {
            setPos([la, ln]);
            onPointChange?.(la, ln);
          }}
        />
        {pos && <Marker position={pos} icon={icon} />}
      </MapContainer>
    </div>
  );
}
