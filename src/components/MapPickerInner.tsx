"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useRef } from "react";
import type {
  Map as LeafletMap,
  LeafletMouseEvent,
  LatLngExpression,
} from "leaflet";
import L from "leaflet";

type Props = {
  lat?: number;
  lng?: number;
  height?: number;
  onChange: (p: { lat: number; lng: number }) => void;
};

// Icon default (CDN) biar aman di Next
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPickerInner({
  lat,
  lng,
  onChange,
  height = 320,
}: Props) {
  const center: LatLngExpression = [lat ?? -6.2, lng ?? 106.816666]; // Jakarta
  const mapRef = useRef<LeafletMap | null>(null);

  const attachClickHandler = () => {
    const map = mapRef.current;
    if (!map) return;
    // pastikan tidak dobel listener
    map.off("click");
    map.on("click", (ev: LeafletMouseEvent) => {
      onChange({ lat: ev.latlng.lat, lng: ev.latlng.lng });
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-amber-200/60">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        style={{ height, width: "100%" }}
        whenReady={attachClickHandler}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {lat !== undefined && lng !== undefined ? (
          <Marker position={[lat, lng]} icon={icon} />
        ) : null}
      </MapContainer>
    </div>
  );
}
