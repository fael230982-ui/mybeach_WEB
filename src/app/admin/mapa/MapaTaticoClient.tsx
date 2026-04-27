"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, MapPinned, RefreshCcw, ShieldAlert, XCircle } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { AdminActionButton, AdminFilterSelect, InlineMetric } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { apiFetch } from "@/lib/apiClient";
import {
  getAlertDisplayName,
  getAlertStatusLabel,
  isActiveAlert,
  isFalseAlarmAlert,
  isInProgressAlert,
  isPendingAlert,
  isResolvedAlert,
} from "@/lib/alerts";
import { extractApiErrorMessage } from "@/lib/errors";
import { getMapPoint, parseZoneCoordinates } from "@/lib/geo";
import {
  buildMapStats,
  filterMapAlerts,
  filterMapPosts,
  filterMapZones,
  getBeachesByCity,
  getFocusedAlert,
  getMapCenter,
} from "@/lib/map-data";
import { queryKeys } from "@/lib/queryKeys";
import { useMapDataQuery } from "@/lib/queries";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, LatLngTuple } from "@/lib/types";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultCenter: LatLngTuple = [-23.9712, -46.3705];

const postIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ center }: { center: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, 14, { animate: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [center, map]);

  return null;
}

export default function MapaTaticoClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const cityFromQuery = searchParams.get("city") || "all";
  const beachFromQuery = searchParams.get("beach") || "all";
  const [selectedCityId, setSelectedCityId] = useState<string>("all");
  const [selectedBeachId, setSelectedBeachId] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const {
    data: mapData,
    error: queryError,
    isLoading,
    isFetching,
    refetch,
  } = useMapDataQuery();
  const alerts = useMemo(() => mapData?.alerts ?? [], [mapData?.alerts]);
  const cities = useMemo(() => mapData?.cities ?? [], [mapData?.cities]);
  const beaches = useMemo(() => mapData?.beaches ?? [], [mapData?.beaches]);
  const posts = useMemo(() => mapData?.posts ?? [], [mapData?.posts]);
  const zones = useMemo(() => mapData?.zones ?? [], [mapData?.zones]);

  useEffect(() => {
    if (!isLoading && mapData) {
      setError(null);
    }
  }, [isLoading, mapData]);

  useEffect(() => {
    setSelectedCityId(cityFromQuery);
  }, [cityFromQuery]);

  useEffect(() => {
    setSelectedBeachId(beachFromQuery);
  }, [beachFromQuery]);

  useEffect(() => {
    if (!queryError) {
      return;
    }

    const typedError = queryError as ApiErrorLike;
    setError(extractApiErrorMessage(typedError, "Não foi possível carregar o mapa tático."));
  }, [queryError]);

  const beachesByCity = useMemo(() => getBeachesByCity(beaches, selectedCityId), [beaches, selectedCityId]);

  useEffect(() => {
    if (
      selectedBeachId !== "all" &&
      !beachesByCity.some((beach) => beach.id === selectedBeachId)
    ) {
      setSelectedBeachId("all");
    }
  }, [beachesByCity, selectedBeachId]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/mapa?${searchParams.toString()}` : "/admin/mapa";
    const nextPath = buildPathWithQueryState("/admin/mapa", searchParams.toString(), {
      city: selectedCityId === "all" ? null : selectedCityId,
      beach: selectedBeachId === "all" ? null : selectedBeachId,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [router, searchParams, selectedBeachId, selectedCityId]);

  const filteredAlerts = useMemo(
    () => filterMapAlerts(alerts, selectedCityId, selectedBeachId),
    [alerts, selectedBeachId, selectedCityId],
  );

  const filteredPosts = useMemo(
    () => filterMapPosts(posts, beaches, selectedCityId, selectedBeachId),
    [beaches, posts, selectedBeachId, selectedCityId],
  );

  const filteredZones = useMemo(
    () => filterMapZones(zones, selectedCityId, selectedBeachId),
    [selectedBeachId, selectedCityId, zones],
  );

  const focusedAlert = useMemo(() => getFocusedAlert(filteredAlerts, focusId), [filteredAlerts, focusId]);

  const mapCenter = useMemo(
    () =>
      getMapCenter({
        focusedAlert,
        beaches,
        cities,
        selectedBeachId,
        selectedCityId,
      }) || defaultCenter,
    [beaches, cities, focusedAlert, selectedBeachId, selectedCityId],
  );

  const stats = useMemo(() => buildMapStats(filteredAlerts), [filteredAlerts]);

  async function handleRefresh() {
    setError(null);

    try {
      await refetch({ throwOnError: true });
    } catch (error_) {
      const typedError = error_ as ApiErrorLike;
      setError(extractApiErrorMessage(typedError, "Não foi possível atualizar o mapa tático."));
    }
  }

  async function updateAlert(alertId: string, status: string) {
    try {
      await apiFetch(`/alerts/${alertId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.mapData }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
    } catch (error_) {
      const typedError = error_ as ApiErrorLike;
      setError(extractApiErrorMessage(typedError, "Não foi possível atualizar a ocorrência."));
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950">
        <LoadingState label="Carregando mapa tático..." surface="dark" size="full" className="min-h-[70vh]" />
      </div>
    );
  }

  if (queryError && !mapData) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950">
        <ErrorState
          surface="dark"
          size="full"
          className="min-h-[70vh]"
          title="Falha ao carregar mapa tático"
          description={error || "Não foi possível sincronizar alertas, cidades, praias, postos e zonas."}
          action={<AdminActionButton onClick={() => void handleRefresh()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-200">Tentar novamente</AdminActionButton>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-100">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <MapPinned className="h-6 w-6 text-cyan-400" />
              Mapa tático
            </h1>
            <p className="text-sm text-slate-400">
              Visão operacional de alertas, zonas e postos com filtros por cidade e praia.
            </p>
          </div>
          <AdminActionButton onClick={() => void handleRefresh()} className="inline-flex items-center gap-2 border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 focus-visible:ring-cyan-200">
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </AdminActionButton>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Cidade</span>
            <AdminFilterSelect
              value={selectedCityId}
              onChange={(event) => setSelectedCityId(event.target.value)}
              className="border-slate-700 bg-slate-900 py-2 text-slate-100 focus:border-cyan-400"
            >
              <option value="all">Todas</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </AdminFilterSelect>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Praia</span>
            <AdminFilterSelect
              value={selectedBeachId}
              onChange={(event) => setSelectedBeachId(event.target.value)}
              className="border-slate-700 bg-slate-900 py-2 text-slate-100 focus:border-cyan-400"
            >
              <option value="all">Todas</option>
              {beachesByCity.map((beach) => (
                <option key={beach.id} value={beach.id}>
                  {beach.name}
                </option>
              ))}
            </AdminFilterSelect>
          </label>

          <InlineMetric label="Pendentes" value={stats.pending} className="border-amber-500/20 bg-amber-500/10" />

          <InlineMetric label="Resolvidos" value={stats.solved} className="border-emerald-500/20 bg-emerald-500/10" />
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <div className="h-[52vh] w-full sm:h-[60vh] xl:h-[72vh]">
            <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitBounds center={mapCenter} />

              {filteredZones.map((zone) => {
                const coordinates = parseZoneCoordinates(zone);
                if (coordinates.length < 3) {
                  return null;
                }

                return (
                  <Polygon
                    key={zone.id}
                    positions={coordinates}
                    pathOptions={{ color: "#22d3ee", fillOpacity: 0.15 }}
                  >
                    <Popup>
                      <strong>{zone.name}</strong>
                    </Popup>
                  </Polygon>
                );
              })}

              {filteredPosts.map((post) => {
                const point = getMapPoint(post);
                if (!point) {
                  return null;
                }

                return (
                  <Marker key={post.id} position={point} icon={postIcon}>
                    <Popup>
                      <strong>{post.name}</strong>
                    </Popup>
                  </Marker>
                );
              })}

              {filteredAlerts.map((alert) => (
                <CircleMarker
                  key={alert.id}
                  center={[alert.latitude, alert.longitude]}
                  radius={focusId === alert.id ? 11 : 8}
                  pathOptions={{
                    color: isResolvedAlert(alert.status) ? "#22c55e" : "#f97316",
                    fillOpacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="space-y-2">
                      <p className="font-semibold">{getAlertDisplayName(alert)}</p>
                      <p className="text-sm">{getAlertStatusLabel(alert.status)}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Em atendimento</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.active}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Postos visíveis</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{filteredPosts.length}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Ocorrências</h2>
              <button
                type="button"
                onClick={() => router.push("/admin/ocorrencias")}
                className="text-sm text-cyan-300 hover:text-cyan-200"
              >
                Ver lista
              </button>
            </div>

            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <EmptyState
                  title="Nenhuma ocorrência encontrada"
                  description="Ajuste os filtros de cidade e praia para localizar ocorrências."
                  surface="dark"
                  size="compact"
                  className="rounded-2xl border border-dashed border-slate-700"
                />
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 ${
                      focusId === alert.id
                        ? "border-cyan-500/50 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">
                          {getAlertDisplayName(alert)}
                        </p>
                        <p className="text-sm text-slate-400">{getAlertStatusLabel(alert.status)}</p>
                      </div>
                      {isResolvedAlert(alert.status) ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : isFalseAlarmAlert(alert.status) ? (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      ) : isInProgressAlert(alert.status) || isActiveAlert(alert.status) ? (
                        <ShieldAlert className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isPendingAlert(alert.status) ? (
                        <AdminActionButton onClick={() => void updateAlert(alert.id, "ACCEPTED")} size="compact" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-200">
                          Assumir
                        </AdminActionButton>
                      ) : null}
                      {!isResolvedAlert(alert.status) ? (
                        <AdminActionButton onClick={() => void updateAlert(alert.id, "RESOLVED")} tone="light" size="compact" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 focus-visible:ring-emerald-200">
                          Resolver
                        </AdminActionButton>
                      ) : null}
                      {!isFalseAlarmAlert(alert.status) ? (
                        <AdminActionButton onClick={() => void updateAlert(alert.id, "FALSE_ALARM")} tone="light" size="compact" className="border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 focus-visible:ring-rose-200">
                          Falso alarme
                        </AdminActionButton>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
