"use client";

import React, { useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { logClientError } from "@/lib/logger";
import type { LatLngTuple } from "@/lib/types";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

const smallDotIcon = new L.DivIcon({
  className: "custom-small-dot",
  html: '<div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.8);cursor:pointer;"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface Props {
  onPolygonChange: (coords: string) => void;
  centerCoords?: LatLngTuple | null;
  initialPolygon?: string;
}

interface ClickHandlerProps {
  setPoints: React.Dispatch<React.SetStateAction<LatLngTuple[]>>;
}

function parseInitialPolygon(initialPolygon?: string): LatLngTuple[] {
  if (!initialPolygon || initialPolygon.length <= 10) {
    return [];
  }

  try {
    const parsed = JSON.parse(initialPolygon) as number[][];
    const leafletPoints: LatLngTuple[] = parsed.map((point) => [point[1], point[0]]);

    if (
      leafletPoints.length > 1 &&
      leafletPoints[0][0] === leafletPoints[leafletPoints.length - 1][0] &&
      leafletPoints[0][1] === leafletPoints[leafletPoints.length - 1][1]
    ) {
      leafletPoints.pop();
    }

    return leafletPoints;
  } catch (error) {
    logClientError("zone-polygon-drawer:parse", error);
    return [];
  }
}

function MapClickHandler({ setPoints }: ClickHandlerProps) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      setPoints((prev) => [...prev, [event.latlng.lat, event.latlng.lng]]);
    },
  });

  return null;
}

export default function BeachPolygonDrawer({
  onPolygonChange,
  centerCoords,
  initialPolygon,
}: Props) {
  const [points, setPoints] = useState<LatLngTuple[]>(() => parseInitialPolygon(initialPolygon));
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setPoints(parseInitialPolygon(initialPolygon));
  }, [initialPolygon]);

  useEffect(() => {
    if (points.length >= 3) {
      const closedPoints = [...points, points[0]];
      const coordsArray = closedPoints.map((point) => [point[1], point[0]]);
      onPolygonChange(JSON.stringify(coordsArray));
      return;
    }

    onPolygonChange("");
  }, [onPolygonChange, points]);

  useEffect(() => {
    if (centerCoords && centerCoords[0] && mapRef.current) {
      mapRef.current.flyTo(centerCoords, 16, { animate: true, duration: 1.5 });
    }
  }, [centerCoords]);

  const handleDragEnd = (index: number, event: L.DragEndEvent) => {
    const marker = event.target as L.Marker;
    const position = marker.getLatLng();

    setPoints((prev) => {
      const next = [...prev];
      next[index] = [position.lat, position.lng];
      return next;
    });
  };

  return (
    <div style={{ width: "100%", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <label style={{ fontWeight: "bold", color: "#64748b", fontSize: "13px" }}>
          Área tática (arraste os pontos para editar):
        </label>
        <button
          onClick={() => setPoints([])}
          type="button"
          style={{ color: "#ef4444", fontWeight: "bold", cursor: "pointer" }}
        >
          Limpar mapa
        </button>
      </div>

      <div
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #cbd5e1",
        }}
      >
        <MapContainer
          ref={mapRef}
          center={centerCoords || [-23.9712, -46.3705]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          <MapClickHandler setPoints={setPoints} />
          {points.length > 0 ? (
            <Polygon
              positions={points}
              pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.5, weight: 3 }}
            />
          ) : null}
          {points.map((point, index) => (
            <Marker
              key={`${point[0]}-${point[1]}-${index}`}
              position={point}
              icon={smallDotIcon}
              draggable
              eventHandlers={{ dragend: (event) => handleDragEnd(index, event) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
