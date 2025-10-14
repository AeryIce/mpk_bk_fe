"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

type Props = {
  lat?: number;
  lng?: number;
  height?: number;
  onChange: (p: { lat: number; lng: number }) => void;
};

// icon default (remote) biar aman di Next
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickCatcher({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPickerInner({ lat, lng, onChange, height = 320 }: Props) {
  const center: [number, number] = [lat ?? -6.2, lng ?? 106.816666]; // Jakarta default

  return (
    <div className="rounded-xl overflow-hidden border border-amber-200/60">
      <MapContainer center={center} zoom={13} style={{ height, width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {lat !== undefined && lng !== undefined ? <Marker position={[lat, lng]} icon={icon} /> : null}
        <ClickCatcher onChange={onChange} />
      </MapContainer>
    </div>
  );
}
