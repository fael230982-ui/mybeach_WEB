"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpZA,
  CheckCircle,
  Download,
  Flag,
  MapPin,
  Plus,
  Power,
  Search,
  ShieldPlus,
  Umbrella,
} from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { AdminActionButton, AdminFilterSelect, AdminSearchInput, AdminStatusBadge } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { exportableBeachRows } from "@/lib/catalog-export";
import { filterBeachCatalog, normalizeBeachStatus } from "@/lib/catalog-data";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { FILTER_ALL_FEMININE } from "@/lib/filters";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useBeachesQuery, useCitiesQuery } from "@/lib/queries";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, AppBeach, AppCity } from "@/lib/types";

function PraiasPageContent() {
  const { confirm, showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const buscaQuery = searchParams.get("busca") || "";
  const cityFromQuery = searchParams.get("cidade") || FILTER_ALL_FEMININE;
  const ordemQuery = searchParams.get("ordem") || "AZ";
  const [busca, setBusca] = useState("");
  const [filtroCidade, setFiltroCidade] = useState(FILTER_ALL_FEMININE);
  const [ordem, setOrdenacao] = useState<"AZ" | "ZA">("AZ");
  const { data: praiasData = [], isError: isBeachesError, isLoading: loadingBeaches, refetch: refetchBeaches } = useBeachesQuery();
  const { data: cidadesData = [], isError: isCitiesError, isLoading: loadingCities, refetch: refetchCities } = useCitiesQuery();
  const carregando = loadingBeaches || loadingCities;
  const hasError = isBeachesError || isCitiesError;
  const cidadesAtivas = cidadesData as AppCity[];
  const praiasSalvas = useMemo(() => normalizeBeachStatus(praiasData as AppBeach[]), [praiasData]);

  const toggleStatusPraia = async (praia: AppBeach) => {
    const novoStatus = praia.status === "ATIVO" ? "INATIVO" : "ATIVO";
    const accepted = await confirm({
      title: `Alterar status de ${praia.name}?`,
      description: `A praia será marcada como ${novoStatus.toLowerCase()}.`,
      confirmLabel: "Alterar praia",
      tone: "primary",
    });

    if (!accepted) {
      return;
    }

    try {
      await apiFetch(`/beaches/${praia.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus, is_active: novoStatus === "ATIVO" }),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.beaches });
      showToast({
        tone: "success",
        title: "Praia atualizada",
        description: `${praia.name} agora está ${novoStatus.toLowerCase()}.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-praias:toggle-status", error, { beachId: praia.id, nextStatus: novoStatus });
      showToast({
        tone: "error",
        title: "Falha ao atualizar praia",
        description: extractApiErrorMessage(error, "A API recusou a alteração da praia."),
      });
    }
  };

  const praiasFiltradas = useMemo(
    () =>
      filterBeachCatalog({
        beaches: praiasSalvas,
        cities: cidadesAtivas,
        cityFilter: filtroCidade,
        search: busca,
        sort: ordem,
      }),
    [busca, cidadesAtivas, filtroCidade, ordem, praiasSalvas],
  );

  function exportarPraias() {
    downloadCsv(
      "praias.csv",
      ["PRAIA", "MUNICIPIO", "UF", "STATUS", "AREA"],
      exportableBeachRows(praiasFiltradas, cidadesAtivas),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A lista atual de praias foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    setBusca(buscaQuery);
  }, [buscaQuery]);

  useEffect(() => {
    setFiltroCidade(cityFromQuery);
  }, [cityFromQuery]);

  useEffect(() => {
    setOrdenacao(ordemQuery === "ZA" ? "ZA" : "AZ");
  }, [ordemQuery]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/praias?${searchParams.toString()}` : "/admin/praias";
    const nextPath = buildPathWithQueryState("/admin/praias", searchParams.toString(), {
      busca,
      cidade: filtroCidade === FILTER_ALL_FEMININE ? null : filtroCidade,
      ordem: ordem === "AZ" ? null : ordem,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [busca, filtroCidade, ordem, router, searchParams]);

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              Gestão de Faixas de Areia
              {carregando ? <span className="h-2.5 w-2.5 animate-ping rounded-full bg-cyan-500" /> : null}
            </h1>
            <p className="mt-1 text-xs text-slate-400">Mapeamento de praias</p>
          </div>
          <AdminActionButton
            type="button"
            onClick={() => router.push("/admin/praias/nova")}
            className="flex items-center gap-2 bg-cyan-500 text-xs text-white shadow-lg hover:bg-cyan-600 focus-visible:ring-cyan-200"
          >
            <Plus size={16} /> Mapear Nova Praia
          </AdminActionButton>
          <AdminActionButton type="button" onClick={exportarPraias} className="flex items-center gap-2 border border-cyan-200 bg-white text-xs text-cyan-700 hover:bg-cyan-50 focus-visible:ring-cyan-200">
            <Download size={16} /> Exportar CSV
          </AdminActionButton>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <label htmlFor="praias-busca" className="sr-only">
              Pesquisar praias por nome, cidade ou UF
            </label>
            <AdminSearchInput
              icon={Search}
              id="praias-busca"
              type="text"
              placeholder="Pesquisar por praia, cidade ou UF..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="focus:border-cyan-500 focus:ring-cyan-500/10"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="flex-1 md:flex-none">
              <label htmlFor="praias-cidade" className="sr-only">
                Filtrar praias por cidade
              </label>
              <AdminFilterSelect
                leadingIcon={MapPin}
                id="praias-cidade"
                value={filtroCidade}
                onChange={(event) => setFiltroCidade(event.target.value)}
                className="cursor-pointer truncate focus:border-cyan-500 sm:max-w-[220px] md:w-auto"
              >
                <option value={FILTER_ALL_FEMININE}>Todas as Cidades</option>
                {cidadesAtivas.map((cidade) => (
                  <option key={cidade.id} value={String(cidade.id)}>
                    {cidade.name}
                  </option>
                ))}
              </AdminFilterSelect>
            </div>
            <AdminActionButton
              type="button"
              tone="light"
              onClick={() => setOrdenacao(ordem === "AZ" ? "ZA" : "AZ")}
              aria-label={ordem === "AZ" ? "Ordenar praias de Z a A" : "Ordenar praias de A a Z"}
              className="flex items-center gap-2 text-sm normal-case tracking-normal text-slate-600 shadow-sm hover:border-cyan-200 hover:text-cyan-600"
            >
              {ordem === "AZ" ? <ArrowDownAZ size={18} /> : <ArrowUpZA size={18} />}
            </AdminActionButton>
          </div>
        </div>

        <div className="flex-1 p-6">
          {carregando ? (
            <LoadingState label="Carregando praias monitoradas..." size="compact" />
          ) : hasError ? (
            <ErrorState
              icon={<AlertTriangle size={48} className="text-amber-400" />}
              title="Falha ao carregar praias"
              description="Não foi possível sincronizar praias e cidades no momento."
              size="compact"
              action={
                <AdminActionButton
                  onClick={() => {
                    void refetchBeaches();
                    void refetchCities();
                  }}
                >
                  Tentar novamente
                </AdminActionButton>
              }
            />
          ) : cidadesAtivas.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={48} className="text-amber-400" />}
              title="Nenhum município cadastrado"
              description="Cadastre um município antes de mapear praias."
              size="compact"
            />
          ) : praiasFiltradas.length === 0 ? (
            <EmptyState
              icon={<Umbrella size={48} className="text-slate-400" />}
              title="Nenhuma praia encontrada"
              description="Ajuste os filtros ou cadastre uma nova faixa de areia."
              size="compact"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {praiasFiltradas.map((praia) => {
                const cidadeDaPraia = cidadesAtivas.find((cidade) => String(cidade.id) === String(praia.city_id));
                const isAtivo = praia.status === "ATIVO";
                const isPoligono = praia.area?.includes("POLYGON");

                return (
                  <div
                    key={praia.id}
                    className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                      !isAtivo ? "grayscale-[0.3] opacity-60" : "hover:border-cyan-300"
                    }`}
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                            isAtivo ? "border-cyan-100 bg-cyan-50 text-cyan-600" : "border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Umbrella size={24} />
                        </div>
                        <AdminStatusBadge tone={isAtivo ? "success" : "neutral"} size="compact" icon={isAtivo ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}>
                          {isAtivo ? "ATIVO" : "DESATIVADO"}
                        </AdminStatusBadge>
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-slate-800">{praia.name}</h3>
                      <p className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-400">
                        <MapPin size={12} />
                        {cidadeDaPraia?.name || "Cidade Vinculada"}
                        {cidadeDaPraia?.state ? ` - ${cidadeDaPraia.state}` : ""}
                        {" - "}
                        {isPoligono ? "Área oficial georreferenciada" : praia.area || "Área não informada"}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
                      <div className="flex gap-2">
                        <AdminActionButton
                          type="button"
                          size="compact"
                          onClick={() => router.push(`/admin/zonas?beach_id=${praia.id}&city_id=${praia.city_id}`)}
                          className="flex flex-1 items-center justify-center gap-1.5 border border-slate-800 bg-slate-900 text-[10px] text-cyan-400 shadow-sm hover:bg-cyan-900 hover:text-cyan-300"
                        >
                          <Flag size={14} /> ZONAS
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          size="compact"
                          tone="light"
                          onClick={() => router.push(`/admin/postos?cidade=${praia.city_id}`)}
                          className="flex flex-1 items-center justify-center gap-1.5 border-red-200 bg-red-50 text-[10px] text-red-600 shadow-sm hover:bg-red-100"
                        >
                          <ShieldPlus size={14} /> POSTOS
                        </AdminActionButton>
                      </div>

                      <AdminActionButton
                        type="button"
                        size="compact"
                        tone="light"
                        onClick={() => void toggleStatusPraia(praia)}
                        className={`flex w-full items-center justify-center gap-2 text-[10px] transition-transform hover:scale-[1.02] ${
                          isAtivo ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100" : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Power size={14} /> {isAtivo ? "DESATIVAR PRAIA" : "ATIVAR PRAIA"}
                      </AdminActionButton>
                    </div>
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

export default function PraiasPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <PraiasPageContent />
    </Suspense>
  );
}
