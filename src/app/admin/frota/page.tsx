"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BatteryCharging,
  Car,
  Download,
  LifeBuoy,
  MapPin,
  Plane,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  Ship,
  Zap,
} from "lucide-react";

import { AdminActionButton, AdminChipButton, AdminFilterSelect, AdminSearchInput } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { formatLastPing, hasRecentPing } from "@/lib/activity";
import { apiFetch } from "@/lib/apiClient";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { exportableFleetRows, normalizeFleetStatus } from "@/lib/fleet-data";
import { FILTER_ALL } from "@/lib/filters";
import { normalizeText, toDisplayStatus } from "@/lib/formatters";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useFleetsQuery } from "@/lib/queries";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, FleetUnit } from "@/lib/types";

const CATEGORIAS_FROTA = [
  FILTER_ALL,
  "VIATURA 4X4",
  "MOTO AQUATICA",
  "QUADRICICLO",
  "BOTE (IRB)",
  "LANCHA",
  "AMBULANCIA",
  "HELICOPTERO",
] as const;

function getFleetIcon(tipo: string) {
  if (tipo.includes("MOTO AQUATICA") || tipo.includes("LANCHA")) return Ship;
  if (tipo.includes("QUADRICICLO")) return Zap;
  if (tipo.includes("BOTE")) return LifeBuoy;
  if (tipo.includes("AMBULANCIA")) return Activity;
  if (tipo.includes("HELICOPTERO")) return Plane;
  return Car;
}

function FrotaEfetivoPageContent() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const queryBusca = searchParams.get("busca") || "";
  const queryTipo = (searchParams.get("tipo") as (typeof CATEGORIAS_FROTA)[number] | null) || FILTER_ALL;
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<(typeof CATEGORIAS_FROTA)[number]>(FILTER_ALL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoPrefixo, setNovoPrefixo] = useState("");
  const [novoTipo, setNovoTipo] = useState<(typeof CATEGORIAS_FROTA)[number]>("VIATURA 4X4");
  const [novoStatus, setNovoStatus] = useState("Na base (parada)");
  const [salvando, setSalvando] = useState(false);
  const { data: frota = [], isError, isLoading: carregando, refetch } = useFleetsQuery();

  const abrirModalNovo = () => {
    setNovoPrefixo("");
    setNovoTipo("VIATURA 4X4");
    setNovoStatus("Na base (parada)");
    setIsModalOpen(true);
  };

  const salvarVeiculo = async () => {
    if (!novoPrefixo.trim()) {
      showToast({
        tone: "error",
        title: "Prefixo obrigatório",
        description: "Informe o prefixo da unidade antes de salvar.",
      });
      return;
    }

    setSalvando(true);
    try {
      await apiFetch("/fleets", {
        method: "POST",
        body: JSON.stringify({
          identifier: novoPrefixo,
          type: novoTipo,
          status: novoStatus,
          base: "Base Central",
          equipe: "Aguardando Efetivo",
          last_ping: "Agora",
        }),
      });
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.fleets });
      showToast({
        tone: "success",
        title: "Unidade cadastrada",
        description: `${novoPrefixo} foi adicionada a frota.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-frota:save", error);
      showToast({
        tone: "error",
        title: "Falha ao salvar unidade",
        description: extractApiErrorMessage(error, "A API recusou o cadastro da nova viatura."),
      });
    } finally {
      setSalvando(false);
    }
  };

  const filtrados = useMemo(
    () =>
      frota.filter((item: FleetUnit) => {
        const prefixo = item.identifier || item.prefixo || "";
        const equipe = item.current_crew || item.equipe || "";
        const termo = normalizeText(busca);
        const matchBusca =
          normalizeText(prefixo).includes(termo) || normalizeText(equipe).includes(termo);
        const tipo = item.type || item.tipo || "";
        const matchTipo = filtroTipo === FILTER_ALL || tipo === filtroTipo;
        return matchBusca && matchTipo;
      }),
    [busca, filtroTipo, frota],
  );

  function exportarFrota() {
    downloadCsv(
      "frota_operacional.csv",
      ["PREFIXO", "TIPO", "STATUS", "GUARNICAO", "BASE", "ULTIMO PING", "ONLINE", "LATITUDE", "LONGITUDE", "POSTO VINCULADO", "OPERACIONAL"],
      exportableFleetRows(filtrados),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A visão atual da frota foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    setBusca(queryBusca);
  }, [queryBusca]);

  useEffect(() => {
    setFiltroTipo(CATEGORIAS_FROTA.includes(queryTipo) ? queryTipo : FILTER_ALL);
  }, [queryTipo]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/frota?${searchParams.toString()}` : "/admin/frota";
    const nextPath = buildPathWithQueryState("/admin/frota", searchParams.toString(), {
      busca,
      tipo: filtroTipo === FILTER_ALL ? null : filtroTipo,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [busca, filtroTipo, router, searchParams]);

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-transparent" />

        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              Frota de Resgate Marítimo
              {carregando ? <span className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-500" /> : null}
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Gestão de viaturas, embarcações e apoio aeromédico
            </p>
          </div>
          <AdminActionButton onClick={abrirModalNovo} className="flex items-center gap-2 bg-amber-500 text-xs text-slate-900 shadow-lg shadow-amber-500/20 hover:bg-amber-600 focus-visible:ring-amber-200">
            <Plus size={16} /> Adicionar unidade
          </AdminActionButton>
          <AdminActionButton onClick={exportarFrota} className="flex items-center gap-2 border border-amber-200 bg-white text-xs text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-200">
            <Download size={16} /> Exportar CSV
          </AdminActionButton>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row">
          <div className="relative w-full shrink-0 md:w-1/3">
            <label htmlFor="frota-busca" className="sr-only">
              Buscar unidade por prefixo ou equipe
            </label>
            <AdminSearchInput
              id="frota-busca"
              type="text"
              placeholder="Buscar por prefixo..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              icon={Search}
              className="py-3.5 text-slate-700 shadow-sm focus:border-amber-500 focus:ring-amber-500/10"
            />
          </div>

          <div className="hide-scrollbar flex w-full gap-2 overflow-x-auto pb-2 scroll-smooth md:pb-0">
            {CATEGORIAS_FROTA.map((tipo) => (
              <AdminChipButton
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                active={filtroTipo === tipo}
              >
                {tipo}
              </AdminChipButton>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] bg-slate-50/50 p-6">
          {carregando ? (
            <LoadingState label="Carregando unidades operacionais..." size="compact" />
          ) : isError ? (
            <ErrorState
              icon={<ShieldAlert size={48} className="text-amber-400" />}
              title="Falha ao carregar frota"
              description="Não foi possível sincronizar as unidades com o backend."
              size="compact"
              action={<AdminActionButton onClick={() => void refetch()} className="bg-slate-900 text-xs text-amber-400 hover:bg-slate-800 focus-visible:ring-amber-200">Tentar novamente</AdminActionButton>}
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={<Car size={48} className="text-slate-400" />}
              title="Garagem vazia"
              description="Nenhuma unidade corresponde aos filtros ativos."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtrados.map((veiculo) => {
                const tipo = veiculo.type || veiculo.tipo || "VIATURA";
                const IconeVeiculo = getFleetIcon(tipo);
                const status = veiculo.status || "Na base (parada)";
                const pingRecente = hasRecentPing(veiculo.last_ping);
                const pingLabel = formatLastPing(veiculo.last_ping);
                const crew = veiculo.current_crew || veiculo.equipe || "Nao designada";
                const base = veiculo.base_sector || veiculo.base || "Base Central";
                const hasCoordinates = veiculo.latitude != null && veiculo.longitude != null;
                const normalizedStatus = normalizeFleetStatus(status);

                let corStatus = "bg-emerald-500 shadow-emerald-500/30";
                if (normalizedStatus === "allocated") corStatus = "bg-amber-500 shadow-amber-500/30 animate-pulse";
                if (normalizedStatus === "maintenance") corStatus = "bg-red-500 shadow-red-500/30";
                if (normalizedStatus === "inactive") corStatus = "bg-slate-500 shadow-slate-500/30";

                return (
                  <div
                    key={veiculo.id}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                  >
                    <div className="relative flex items-start justify-between overflow-hidden border-b border-slate-100 p-5">
                      <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:scale-110 group-hover:opacity-10">
                        <IconeVeiculo size={80} />
                      </div>
                      <div className="relative z-10">
                        <span className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <IconeVeiculo size={12} /> {tipo}
                        </span>
                        <h3 className="text-2xl font-black tracking-tighter text-slate-800">
                          {veiculo.identifier || veiculo.prefixo || "S/N"}
                        </h3>
                      </div>
                      <div className="relative z-10 flex flex-col items-end gap-1.5">
                        <div className={`h-3 w-3 rounded-full shadow-lg ${corStatus}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          {toDisplayStatus(status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between bg-gradient-to-b from-transparent to-slate-50/50 p-5">
                      <div className="space-y-4">
                        <div>
                          <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Guarnição atual
                          </span>
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <ShieldAlert size={14} className="text-amber-500" />
                            {crew}
                          </p>
                        </div>
                        <div>
                          <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Base / Setor
                          </span>
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <MapPin size={14} className="text-blue-500" />
                            {base}
                          </p>
                        </div>
                        {hasCoordinates ? (
                          <div>
                            <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Localizacao
                            </span>
                            <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <MapPin size={14} className="text-emerald-500" />
                              {veiculo.latitude}, {veiculo.longitude}
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-mono font-bold ${pingRecente ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"}`}>
                          <Radio size={10} className={pingRecente ? "text-emerald-500" : "text-slate-400"} />
                          Ping: {pingLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div role="dialog" aria-modal="true" aria-labelledby="frota-modal-title" className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 id="frota-modal-title" className="flex items-center gap-2 text-lg font-black text-slate-800">
                <BatteryCharging size={20} className="text-amber-500" /> Registrar unidade
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal de cadastro de unidade"
                className="text-slate-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                X
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label htmlFor="frota-prefixo" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Prefixo de rádio
                </label>
                <input
                  id="frota-prefixo"
                  type="text"
                  value={novoPrefixo}
                  onChange={(event) => setNovoPrefixo(event.target.value.toUpperCase())}
                  placeholder="Ex: UR-192"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black uppercase outline-none transition-all focus:border-amber-500 focus:bg-white focus-visible:ring-4 focus-visible:ring-amber-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="frota-categoria" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Categoria
                  </label>
                  <AdminFilterSelect
                    id="frota-categoria"
                    value={novoTipo}
                    onChange={(event) => setNovoTipo(event.target.value as (typeof CATEGORIAS_FROTA)[number])}
                    className="bg-slate-50 py-3.5 text-sm text-slate-700 focus:border-amber-500 focus:bg-white"
                  >
                    {CATEGORIAS_FROTA.filter((item) => item !== FILTER_ALL).map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </AdminFilterSelect>
                </div>
                <div>
                  <label htmlFor="frota-status" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status inicial
                  </label>
                  <AdminFilterSelect
                    id="frota-status"
                    value={novoStatus}
                    onChange={(event) => setNovoStatus(event.target.value)}
                    className="bg-slate-50 py-3.5 text-sm text-slate-700 focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Na base (parada)">Na base (parada)</option>
                    <option value="em uso ou alocada">Em uso/alocada</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="baixada (inativa)">Baixada</option>
                  </AdminFilterSelect>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-6">
              <AdminActionButton onClick={salvarVeiculo} disabled={salvando} className="flex w-full items-center justify-center gap-2 bg-slate-900 py-4 text-xs text-amber-400 hover:bg-slate-800 focus-visible:ring-amber-100">
                {salvando ? "Sincronizando..." : "Despachar unidade"}
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function FrotaEfetivoPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <FrotaEfetivoPageContent />
    </Suspense>
  );
}
