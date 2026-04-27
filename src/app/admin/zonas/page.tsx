"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Download, Flag, Plus } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { AdminActionButton, AdminFilterSelect, AdminStatusBadge } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { exportableZoneRows } from "@/lib/catalog-export";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { parseZoneCoordinates } from "@/lib/geo";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useBeachesQuery, useZonesQuery } from "@/lib/queries";
import { getOperationalBeachCenter } from "@/lib/territory-data";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, AppBeach, AppZone, LatLngTuple } from "@/lib/types";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

function ZonasPageContent() {
  const { confirm, showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filtroPraiaQuery = searchParams.get("beach_id") || "";
  const cidadeUrl = searchParams.get("city_id") || "";
  const [filtroPraia, setFiltroPraia] = useState("");
  const [manualCameraCenter, setManualCameraCenter] = useState<LatLngTuple | null>(null);
  const { data: zonas = [], isError: isZonesError, isLoading: zonasLoading, refetch: refetchZones } = useZonesQuery();
  const { data: praias = [], isError: isBeachesError, isLoading: praiasLoading, refetch: refetchBeaches } = useBeachesQuery();
  const carregando = zonasLoading || praiasLoading;
  const hasError = isZonesError || isBeachesError;

  const praiasOrdenadas = useMemo(
    () => [...(praias as AppBeach[])].sort((a, b) => a.name.localeCompare(b.name)),
    [praias],
  );
  const cameraCenter = useMemo(() => {
    if (manualCameraCenter) {
      return manualCameraCenter;
    }

    if (filtroPraia && filtroPraia !== "TODAS") {
      const beach = (praias as AppBeach[]).find((item) => String(item.id) === String(filtroPraia));
      return getOperationalBeachCenter(beach) || ([-23.97, -46.33] as LatLngTuple);
    }

    return [-23.97, -46.33] as LatLngTuple;
  }, [filtroPraia, manualCameraCenter, praias]);
  const zonasFiltradas = useMemo(
    () =>
      filtroPraia && filtroPraia !== "TODAS"
        ? (zonas as AppZone[]).filter((zona) => String(zona.beach_id) === String(filtroPraia))
        : (zonas as AppZone[]),
    [filtroPraia, zonas],
  );

  function exportarZonas() {
    downloadCsv(
      "zonas.csv",
      ["ZONA", "PRAIA", "NIVEL", "COORDENADAS"],
      exportableZoneRows(zonasFiltradas, praias as AppBeach[]),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A lista atual de zonas foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    setFiltroPraia(filtroPraiaQuery);
  }, [filtroPraiaQuery]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/zonas?${searchParams.toString()}` : "/admin/zonas";
    const nextPath = buildPathWithQueryState("/admin/zonas", searchParams.toString(), {
      beach_id: !filtroPraia || filtroPraia === "TODAS" ? null : filtroPraia,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [filtroPraia, router, searchParams]);

  const mudarPraia = (id: string) => {
    setFiltroPraia(id);
    const praia = praias.find((item) => String(item.id) === id);
    const center = getOperationalBeachCenter(praia);
    if (center) setManualCameraCenter(center);
  };

  const excluirZona = async (zona: AppZone) => {
    const accepted = await confirm({
      title: `Excluir zona ${zona.name}?`,
      description: "Essa área será removida permanentemente do mapa.",
      confirmLabel: "Excluir zona",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      await apiFetch(`/zones/${zona.id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.zones });
      showToast({ tone: "success", title: "Zona excluída", description: `${zona.name} foi removida do mapa.` });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-zonas:delete", error, { zoneId: zona.id });
      showToast({
        tone: "error",
        title: "Falha ao excluir zona",
        description: extractApiErrorMessage(error, "A API não confirmou a exclusão da zona."),
      });
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-xl md:flex-row md:items-center">
        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">Gestão de Zonas de Risco</h1>
            <p className="mt-1 text-xs text-slate-400">Gerencie as áreas perigosas no mar</p>
          </div>
          <div className="flex gap-3">
            <AdminActionButton onClick={() => router.push("/admin/praias")} className="bg-slate-800 text-xs text-white hover:bg-slate-700"><ArrowLeft size={16} className="mr-2 inline" />Voltar</AdminActionButton>
            <AdminActionButton onClick={() => router.push(`/admin/zonas/nova?beach_id=${filtroPraia}&city_id=${cidadeUrl}`)} className="bg-red-500 text-xs text-white hover:bg-red-600 focus-visible:ring-red-200"><Plus size={16} className="mr-2 inline" />Nova Zona</AdminActionButton>
            <AdminActionButton onClick={exportarZonas} className="border border-red-200 bg-white text-xs text-red-700 hover:bg-red-50 focus-visible:ring-red-200"><Download size={16} className="mr-2 inline" />Exportar CSV</AdminActionButton>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 p-4">
          <AdminFilterSelect value={filtroPraia} onChange={(event) => mudarPraia(event.target.value)} className="max-w-md bg-white py-3 text-sm text-slate-600">
            <option value="TODAS">-- Selecione a Praia --</option>
            {praiasOrdenadas.map((praia) => <option key={praia.id} value={String(praia.id)}>{praia.name}</option>)}
          </AdminFilterSelect>
        </div>

        {typeof window !== "undefined" && filtroPraia && filtroPraia !== "TODAS" ? (
          <div className="h-[300px] w-full border-b border-slate-200 bg-slate-100">
            <MapContainer key={`${cameraCenter[0]}-${cameraCenter[1]}`} center={cameraCenter} zoom={15} style={{ height: "100%", width: "100%", zIndex: 10 }}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              {zonasFiltradas.map((zona) => {
                const coords = parseZoneCoordinates(zona);
                if (coords.length === 0) return null;
                const cor = zona.status_level === "BAIXO" ? "#22c55e" : zona.status_level === "MEDIO" ? "#eab308" : "#ef4444";
                return <Polygon key={zona.id} positions={coords} pathOptions={{ color: cor, fillColor: cor, fillOpacity: 0.5, weight: 2 }}><Tooltip sticky><strong>{zona.name}</strong></Tooltip></Polygon>;
              })}
            </MapContainer>
          </div>
        ) : null}

        <div className="p-6">
          {carregando ? (
            <LoadingState label="Carregando zonas monitoradas..." size="compact" />
          ) : hasError ? (
            <ErrorState
              title="Falha ao carregar zonas"
              description="Não foi possível sincronizar zonas e praias neste momento."
              className="rounded-2xl border border-amber-200 bg-amber-50"
              size="compact"
              action={
                <AdminActionButton
                  onClick={() => {
                    void refetchZones();
                    void refetchBeaches();
                  }}
                >
                  Tentar novamente
                </AdminActionButton>
              }
            />
          ) : zonasFiltradas.length === 0 ? (
            <EmptyState title="Nenhuma zona cadastrada aqui" description="Selecione outra praia ou cadastre uma nova zona de risco." size="compact" />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {zonasFiltradas.map((zona) => {
                const tone = zona.status_level === "BAIXO" ? "success" : zona.status_level === "MEDIO" ? "warning" : "danger";
                return (
                  <div key={zona.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="mb-3"><AdminStatusBadge tone={tone} icon={<Flag size={14} />}>{zona.status_level}</AdminStatusBadge></div>
                    <h3 className="text-lg font-black text-slate-800">{zona.name}</h3>
                    <div className="mt-4 flex gap-2"><AdminActionButton onClick={() => excluirZona(zona)} tone="light" size="compact" className="flex-1 border-red-200 bg-red-50 text-[10px] text-red-600 hover:bg-red-100">Excluir</AdminActionButton></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ZonasPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <ZonasPageContent />
    </Suspense>
  );
}
