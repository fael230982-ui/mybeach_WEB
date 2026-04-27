"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLngTuple } from "@/lib/types";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const iconAlvo = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MudaCentroMapaProps {
  center: LatLngTuple | null;
}

interface MapaPostoClientProps {
  lat: string;
  lng: string;
  setLat: (value: string) => void;
  setLng: (value: string) => void;
  mapCenter: LatLngTuple | null;
}

function MudaCentroMapa({ center }: MudaCentroMapaProps) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2 && !Number.isNaN(center[0])) {
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.setView(center, 15, { animate: true });
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [center, map]);

  return null;
}

function MarcadorDeClique({
  setLat,
  setLng,
}: Pick<MapaPostoClientProps, "setLat" | "setLng">) {
  useMapEvents({
    click(event) {
      setLat(event.latlng.lat.toString());
      setLng(event.latlng.lng.toString());
    },
  });

  return null;
}

export default function MapaPostoClient({
  lat,
  lng,
  setLat,
  setLng,
  mapCenter,
}: MapaPostoClientProps) {
  const temPino = lat && lng && !Number.isNaN(Number.parseFloat(lat));
  const posAtual: LatLngTuple | null = temPino
    ? [Number.parseFloat(lat), Number.parseFloat(lng)]
    : null;
  const centroInicial: LatLngTuple = posAtual || mapCenter || [-23.9712, -46.3705];

  return (
    <MapContainer
      center={centroInicial}
      zoom={14}
      style={{ height: "100%", width: "100%", zIndex: 1, borderRadius: "0.75rem" }}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <MudaCentroMapa center={mapCenter} />
      <MarcadorDeClique setLat={setLat} setLng={setLng} />
      {posAtual && <Marker position={posAtual} icon={iconAlvo} />}
    </MapContainer>
  );
}
