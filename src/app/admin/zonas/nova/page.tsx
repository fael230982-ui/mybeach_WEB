"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Flag, MapPin, ShieldAlert } from "lucide-react";

import { AdminActionButton, AdminChipButton, AdminFieldLabel, AdminFilterSelect } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { extractApiErrorMessage } from "@/lib/errors";
import { logClientError } from "@/lib/logger";
import { useBeachesQuery, useCitiesQuery } from "@/lib/queries";
import { zoneFormSchema } from "@/lib/schemas";
import { filterBeachesByCity, getOperationalBeachCenter } from "@/lib/territory-data";
import type { ApiErrorLike, AppBeach, AppCity, LatLngTuple } from "@/lib/types";

const MapaZonaDinamico = dynamic(() => import("@/components/ZonePolygonDrawer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-400">
      Iniciando satélite...
    </div>
  ),
});

function NovaZonaPageContent() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedCidade, setSelectedCidade] = useState("");
  const [beachId, setBeachId] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
  const [statusLevel, setStatusLevel] = useState<"BAIXO" | "MEDIO" | "ALTO">("MEDIO");
  const { data: cidades = [] } = useCitiesQuery();
  const { data: praias = [] } = useBeachesQuery();
  const urlBeachId = searchParams.get("beach_id");
  const urlCityId = searchParams.get("city_id");

  useEffect(() => {
    if (urlCityId && urlCityId !== "TODAS") {
      setSelectedCidade(urlCityId);
    }

    if (urlBeachId && urlBeachId !== "TODAS") {
      setBeachId(urlBeachId);
      const praia = (praias as AppBeach[]).find((item) => String(item.id) === String(urlBeachId));
      const center = getOperationalBeachCenter(praia);
      if (center) {
        setMapCenter(center);
      }
    }
  }, [praias, urlBeachId, urlCityId]);

  const praiasFiltradas = useMemo(
    () => filterBeachesByCity(praias as AppBeach[], selectedCidade),
    [praias, selectedCidade],
  );

  const handleSelecionarPraia = (id: string) => {
    setBeachId(id);
    const praia = praias.find((item) => String(item.id) === String(id));
    const center = getOperationalBeachCenter(praia);
    if (center) {
      setMapCenter(center);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let parsedCoordinates: number[][] = [];
    try {
      parsedCoordinates = JSON.parse(coordinates) as number[][];
    } catch {
      parsedCoordinates = [];
    }

    const parsed = zoneFormSchema.safeParse({
      name,
      beach_id: beachId,
      status_level: statusLevel,
      coordinates: parsedCoordinates,
    });

    if (!parsed.success) {
      showToast({
        tone: "error",
        title: "Dados inválidos",
        description: parsed.error.issues[0]?.message || "Revise os dados da zona de risco.",
      });
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/zones", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });

      showToast({ tone: "success", title: "Zona criada", description: `${name} foi cadastrada com sucesso.` });
      router.push(`/admin/zonas?beach_id=${beachId}&city_id=${selectedCidade}`);
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-zonas-nova:create", error);
      showToast({
        tone: "error",
        title: "Falha ao salvar zona",
        description: extractApiErrorMessage(error, "A API recusou o cadastro da zona."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon,
            .leaflet-interactive.leaflet-marker-draggable {
              width: 8px !important;
              height: 8px !important;
              margin-left: -4px !important;
              margin-top: -4px !important;
              border-radius: 50% !important;
              background-color: white !important;
              border: 2px solid #ef4444 !important;
              box-shadow: 0 0 2px rgba(0,0,0,0.8) !important;
              outline: none !important;
            }
          `,
        }}
      />

      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-red-500/10 blur-[80px]" />
        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              <Flag size={28} className="text-red-500" />
              Nova Zona de Risco
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Demarque a área de perigo direto no satélite
            </p>
          </div>
          <AdminActionButton
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 border border-slate-700 bg-slate-800 text-xs text-white shadow-lg hover:bg-slate-700 focus-visible:ring-red-100"
          >
            <ArrowLeft size={16} /> Voltar
          </AdminActionButton>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="nova-zona-nome" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                1. Nome do risco
              </label>
              <input
                id="nova-zona-nome"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Corrente de Retorno"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-colors focus:border-red-500 focus-visible:ring-4 focus-visible:ring-red-100"
              />
            </div>

            <div className="space-y-2">
              <AdminFieldLabel htmlFor="nova-zona-cidade" className="mb-0 ml-0">2. Cidade</AdminFieldLabel>
              <AdminFilterSelect
                id="nova-zona-cidade"
                value={selectedCidade}
                onChange={(event) => setSelectedCidade(event.target.value)}
                className="bg-slate-50 py-3 text-sm text-slate-700 focus:border-red-500"
              >
                <option value="">-- Cidades --</option>
                {(cidades as AppCity[]).map((cidade) => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.name}
                  </option>
                ))}
              </AdminFilterSelect>
            </div>

            <div className="space-y-2">
              <AdminFieldLabel htmlFor="nova-zona-praia" className="mb-0 ml-0">3. Praia</AdminFieldLabel>
              <AdminFilterSelect
                id="nova-zona-praia"
                value={beachId}
                onChange={(event) => handleSelecionarPraia(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-red-100 ${
                  beachId
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                    : "border-slate-200 bg-slate-50 focus:border-red-500"
                }`}
              >
                <option value="">-- Escolha a praia --</option>
                {praiasFiltradas.map((praia) => (
                  <option key={praia.id} value={praia.id}>
                    {praia.name}
                  </option>
                ))}
              </AdminFilterSelect>
              {selectedCidade && praiasFiltradas.length === 0 ? (
                <p className="text-xs font-medium text-slate-500">Nenhuma praia encontrada para a cidade selecionada.</p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ShieldAlert size={14} /> 4. Classificação de risco
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              {(["BAIXO", "MEDIO", "ALTO"] as const).map((nivel) => {
                const isSelected = statusLevel === nivel;
                const selectedClass =
                  nivel === "BAIXO"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md"
                    : nivel === "MEDIO"
                      ? "bg-amber-50 border-amber-500 text-amber-600 shadow-md"
                      : "bg-red-50 border-red-500 text-red-600 shadow-md";
                return (
                  <AdminChipButton
                    key={nivel}
                    onClick={() => setStatusLevel(nivel)}
                    active={isSelected}
                    className={`flex-1 border-2 py-4 text-xs focus-visible:ring-red-100 ${
                      isSelected ? selectedClass : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {nivel}
                  </AdminChipButton>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <label htmlFor="nova-zona-mapa" className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              5. Desenho do perímetro
            </label>

            {beachId ? (
              <div
                id="nova-zona-mapa"
                className="relative h-[600px] w-full overflow-hidden rounded-2xl border-2 border-slate-200 shadow-inner focus-within:border-cyan-500"
              >
                <MapaZonaDinamico
                  key={beachId}
                  onPolygonChange={setCoordinates}
                  centerCoords={mapCenter}
                />
              </div>
            ) : (
              <div
                id="nova-zona-mapa"
                className="flex h-[600px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400"
              >
                <MapPin size={48} className="mb-4 opacity-30" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Aguardando seleção
                </p>
                <p className="mt-1 text-xs font-medium">
                  Selecione uma praia no passo 3 para liberar o satélite
                </p>
              </div>
            )}
          </div>

          <AdminActionButton
            type="submit"
            disabled={loading || !beachId || !coordinates}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-sm transition-all focus-visible:ring-red-100 ${
              loading || !beachId || !coordinates
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                : "bg-red-600 text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:scale-[1.01] hover:bg-red-700"
            }`}
          >
            {loading ? "Transmitindo para a base..." : <><Flag size={18} /> Fixar zona no banco de dados</>}
          </AdminActionButton>
        </form>
      </div>
    </div>
  );
}

export default function NovaZonaPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <NovaZonaPageContent />
    </Suspense>
  );
}
