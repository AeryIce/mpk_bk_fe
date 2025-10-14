"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useRef, useEffect } from "react";
import type { Map as LeafletMap, LeafletMouseEvent, LatLngExpression } from "leaflet";
import L from "leaflet";

type Props = {
  lat?: number;
  lng?: number;
  height?: number;
  onChange: (p: { lat: number; lng: number }) => void;
};

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPickerInner({ lat, lng, onChange, height = 320 }: Props) {
  const center: LatLngExpression = [lat ?? -6.2, lng ?? 106.816666];
  const mapRef = useRef<LeafletMap | null>(null);
  const attachedRef = useRef(false);

  const attachClickHandler = () => {
    const map = mapRef.current;
    if (!map || attachedRef.current) return;
    const handler = (ev: LeafletMouseEvent) => onChange({ lat: ev.latlng.lat, lng: ev.latlng.lng });
    map.on("click", handler);
    attachedRef.current = true;
  };

  useEffect(() => {
    const t = setTimeout(attachClickHandler, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border border-amber-200/60">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={16}
        style={{ height, width: "100%" }}
        whenReady={attachClickHandler}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {lat !== undefined && lng !== undefined ? <Marker position={[lat, lng]} icon={icon} /> : null}
      </MapContainer>
    </div>
  );
}
