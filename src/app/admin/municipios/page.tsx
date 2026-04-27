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
  DownloadCloud,
  Filter,
  Map,
  MapPin,
  Power,
  Search,
  ShieldPlus,
  Waves,
} from "lucide-react";

import { AdminHero } from "@/components/ui/AdminHero";
import { AdminActionButton, AdminFieldLabel, AdminFilterSelect, AdminSearchInput, AdminStatusBadge } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { exportableCityRows } from "@/lib/catalog-export";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { FILTER_ALL } from "@/lib/filters";
import { normalizeText } from "@/lib/formatters";
import { ESTADOS_BR, fetchIbgeCitiesByState, type IbgeCity } from "@/lib/ibge";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useBeachesQuery, useCitiesQuery, usePostsQuery } from "@/lib/queries";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, AppCity } from "@/lib/types";

type CityCard = AppCity & { qtdPraias: number; qtdPostos: number };

function MunicipiosPageContent() {
  const { confirm, showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const buscaQuery = searchParams.get("busca") || "";
  const statusQuery = searchParams.get("status") || FILTER_ALL;
  const ordemQuery = searchParams.get("ordem") || "AZ";
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState(FILTER_ALL);
  const [ordem, setOrdenacao] = useState("AZ");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [municipiosIBGE, setMunicipiosIBGE] = useState<IbgeCity[]>([]);
  const [carregandoIBGE, setCarregandoIBGE] = useState(false);
  const [cidadeSelecionadaIBGE, setCidadeSelecionadaIBGE] = useState("");
  const [ufSelecionada, setUfSelecionada] = useState("SP");
  const [salvando, setSalvando] = useState(false);
  const { data: cidadesData = [], isError: isCitiesError, isLoading: loadingCities, refetch: refetchCities } = useCitiesQuery();
  const { data: praiasData = [], isError: isBeachesError, isLoading: loadingBeaches, refetch: refetchBeaches } = useBeachesQuery();
  const { data: postosData = [], isError: isPostsError, isLoading: loadingPosts, refetch: refetchPosts } = usePostsQuery();
  const carregando = loadingCities || loadingBeaches || loadingPosts;
  const hasError = isCitiesError || isBeachesError || isPostsError;

  const municipiosSalvos = useMemo<CityCard[]>(
    () =>
      cidadesData.map((city) => {
        const praiasDaCidade = praiasData.filter((praia) => praia.city_id === city.id);
        const idsDasPraias = praiasDaCidade.map((praia) => praia.id);
        const postosDaCidade = postosData.filter((posto) => idsDasPraias.includes(posto.beach_id));

        return {
          ...city,
          status: city.status ? city.status.toUpperCase() : "ATIVO",
          qtdPraias: praiasDaCidade.length,
          qtdPostos: postosDaCidade.length,
        };
      }),
    [cidadesData, praiasData, postosData],
  );

  async function carregarCidadesIBGE(uf: string) {
    setCarregandoIBGE(true);
    try {
      const data = await fetchIbgeCitiesByState(uf);
      setMunicipiosIBGE(data);
      setCidadeSelecionadaIBGE(data[0] ? data[0].id.toString() : "");
    } catch (error) {
      logClientError("admin-municipios:ibge", error, { uf });
      setMunicipiosIBGE([]);
      setCidadeSelecionadaIBGE("");
    } finally {
      setCarregandoIBGE(false);
    }
  }

  function abrirModalNovo() {
    setUfSelecionada("SP");
    setIsModalOpen(true);
    void carregarCidadesIBGE("SP");
  }

  async function salvarMunicipio() {
    if (!cidadeSelecionadaIBGE) {
      showToast({
        tone: "error",
        title: "Cidade obrigatória",
        description: "Selecione uma cidade da lista oficial do IBGE.",
      });
      return;
    }

    const cidadeIBGE = municipiosIBGE.find((city) => city.id.toString() === cidadeSelecionadaIBGE);
    if (!cidadeIBGE) {
      return;
    }

    setSalvando(true);
    try {
      await apiFetch("/cities", {
        method: "POST",
        body: JSON.stringify({
          name: cidadeIBGE.nome,
          state: ufSelecionada,
        }),
      });

      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cities });
      showToast({
        tone: "success",
        title: "Município importado",
        description: `${cidadeIBGE.nome} foi adicionado com sucesso.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-municipios:create", error, { uf: ufSelecionada, cityId: cidadeSelecionadaIBGE });
      showToast({
        tone: "error",
        title: "Falha ao importar",
        description: extractApiErrorMessage(error, "Verifique se a API está online e aceitando requisições."),
      });
    } finally {
      setSalvando(false);
    }
  }

  async function toggleStatusCidade(city: CityCard) {
    const novoStatus = city.status === "ATIVO" ? "INATIVO" : "ATIVO";
    const accepted = await confirm({
      title: `Alterar status de ${city.name}?`,
      description: `O município será marcado como ${novoStatus.toLowerCase()}.`,
      confirmLabel: "Alterar status",
      tone: "primary",
    });

    if (!accepted) {
      return;
    }

    try {
      await apiFetch(`/cities/${city.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: novoStatus,
          is_active: novoStatus === "ATIVO",
        }),
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.cities });
      showToast({
        tone: "success",
        title: "Status atualizado",
        description: `${city.name} agora está ${novoStatus.toLowerCase()}.`,
      });
    } catch (error_) {
      const error = error_ as ApiErrorLike;
      logClientError("admin-municipios:update", error, { cityId: city.id });
      showToast({
        tone: "error",
        title: "Falha ao atualizar município",
        description: extractApiErrorMessage(error, "O back-end recusou a alteração do município."),
      });
    }
  }

  const municipiosFiltrados = useMemo(() => {
    const termoBusca = normalizeText(busca);
    const filtrados = municipiosSalvos.filter((city) => {
      const matchBusca =
        !busca ||
        normalizeText(city.name).includes(termoBusca) ||
        normalizeText(String(city.state || city.uf || "")).includes(termoBusca);

      const matchStatus = filtroStatus === FILTER_ALL || city.status === filtroStatus;
      return matchBusca && matchStatus;
    });

    filtrados.sort((a, b) => {
      const nomeA = a.name.toLowerCase();
      const nomeB = b.name.toLowerCase();
      return ordem === "AZ" ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
    });

    return filtrados;
  }, [busca, filtroStatus, municipiosSalvos, ordem]);

  function exportarMunicipios() {
    downloadCsv(
      "municipios.csv",
      ["MUNICIPIO", "UF", "STATUS", "PRAIAS", "POSTOS"],
      exportableCityRows(municipiosFiltrados),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A lista atual de municípios foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    setBusca(buscaQuery);
  }, [buscaQuery]);

  useEffect(() => {
    setFiltroStatus(statusQuery === "ATIVO" || statusQuery === "INATIVO" ? statusQuery : FILTER_ALL);
  }, [statusQuery]);

  useEffect(() => {
    setOrdenacao(ordemQuery === "ZA" ? "ZA" : "AZ");
  }, [ordemQuery]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/municipios?${searchParams.toString()}` : "/admin/municipios";
    const nextPath = buildPathWithQueryState("/admin/municipios", searchParams.toString(), {
      busca,
      status: filtroStatus === FILTER_ALL ? null : filtroStatus,
      ordem: ordem === "AZ" ? null : ordem,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [busca, filtroStatus, ordem, router, searchParams]);

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <AdminHero
        title="Gestão de Cidades"
        description="Municípios litorâneos credenciados via IBGE"
        icon={Map}
        accent="blue"
        loading={carregando}
        actions={
          <>
            <AdminActionButton
              type="button"
              onClick={abrirModalNovo}
              className="flex items-center gap-2 bg-blue-500 text-xs text-white shadow-lg hover:bg-blue-600 focus-visible:ring-blue-200"
            >
              <DownloadCloud size={16} />
              Importar do IBGE
            </AdminActionButton>
            <AdminActionButton type="button" onClick={exportarMunicipios} className="flex items-center gap-2 border border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-200">
              <Download size={16} />
              Exportar CSV
            </AdminActionButton>
          </>
        }
      />

      <div className="flex min-h-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <label htmlFor="municipios-busca" className="sr-only">
              Pesquisar municípios por cidade ou UF
            </label>
            <AdminSearchInput
              icon={Search}
              id="municipios-busca"
              type="text"
              placeholder="Pesquisar por cidade ou UF..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <div className="flex-1 md:flex-none">
              <label htmlFor="municipios-status" className="sr-only">
                Filtrar municípios por status
              </label>
              <AdminFilterSelect
                leadingIcon={Filter}
                id="municipios-status"
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
                className="cursor-pointer appearance-none md:w-auto"
              >
                <option value={FILTER_ALL}>Todos os status</option>
                <option value="ATIVO">Apenas ativos</option>
                <option value="INATIVO">Apenas inativos</option>
              </AdminFilterSelect>
            </div>

            <AdminActionButton
              type="button"
              tone="light"
              onClick={() => setOrdenacao(ordem === "AZ" ? "ZA" : "AZ")}
              aria-label={ordem === "AZ" ? "Ordenar de Z a A" : "Ordenar de A a Z"}
              className="flex items-center gap-2 text-sm normal-case tracking-normal text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600"
            >
              {ordem === "AZ" ? <ArrowDownAZ size={18} /> : <ArrowUpZA size={18} />}
            </AdminActionButton>
          </div>
        </div>

        <div className="flex-1 p-6">
          {carregando ? (
            <LoadingState label="Carregando municípios monitorados..." size="compact" />
          ) : hasError ? (
            <ErrorState
              icon={<AlertTriangle size={48} className="text-amber-400" />}
              title="Falha ao carregar municípios"
              description="Não foi possível sincronizar cidades, praias e postos no momento."
              size="compact"
              action={
                <AdminActionButton
                  onClick={() => {
                    void refetchCities();
                    void refetchBeaches();
                    void refetchPosts();
                  }}
                >
                  Tentar novamente
                </AdminActionButton>
              }
            />
          ) : municipiosFiltrados.length === 0 ? (
            <EmptyState
              icon={<Map size={48} className="text-slate-400" />}
              title="Nenhuma cidade encontrada"
              description="Ajuste os filtros ou importe um novo município da base IBGE."
              size="compact"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {municipiosFiltrados.map((city) => {
                const isAtivo = city.status === "ATIVO";

                return (
                  <div
                    key={city.id}
                    className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                      !isAtivo ? "opacity-60 grayscale-[0.3]" : "hover:border-blue-300"
                    }`}
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                            isAtivo
                              ? "border-blue-100 bg-blue-50 text-blue-600"
                              : "border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Map size={24} />
                        </div>
                        <AdminStatusBadge tone={isAtivo ? "success" : "neutral"} size="compact" icon={isAtivo ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}>
                          {isAtivo ? "ATIVO" : "DESATIVADO"}
                        </AdminStatusBadge>
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-slate-800">{city.name}</h3>
                      <p className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-400">
                        <MapPin size={12} />
                        Estado: {city.state || city.uf || "N/A"}
                      </p>

                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <AdminActionButton
                          type="button"
                          tone="light"
                          onClick={() => router.push(`/admin/praias?cidade=${city.id}`)}
                          aria-label={`Abrir praias de ${city.name}`}
                          className="flex flex-1 items-center gap-2 rounded-lg border-cyan-100 bg-cyan-50/50 p-2 normal-case tracking-normal text-slate-700 transition-all hover:-translate-y-1 hover:bg-cyan-100"
                        >
                          <Waves size={14} className="text-cyan-600" />
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600">
                              Praias
                            </span>
                            <span className="mt-1 text-sm font-black text-slate-700">
                              {city.qtdPraias}
                            </span>
                          </div>
                        </AdminActionButton>

                        <AdminActionButton
                          type="button"
                          tone="light"
                          onClick={() => router.push(`/admin/postos?cidade=${city.id}`)}
                          aria-label={`Abrir postos de ${city.name}`}
                          className="flex flex-1 items-center gap-2 rounded-lg border-indigo-100 bg-indigo-50/50 p-2 normal-case tracking-normal text-slate-700 transition-all hover:-translate-y-1 hover:bg-indigo-100"
                        >
                          <ShieldPlus size={14} className="text-indigo-600" />
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                              Postos
                            </span>
                            <span className="mt-1 text-sm font-black text-slate-700">
                              {city.qtdPostos}
                            </span>
                          </div>
                        </AdminActionButton>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between pt-4">
                      <AdminActionButton
                        type="button"
                        tone="light"
                        size="compact"
                        onClick={() => void toggleStatusCidade(city)}
                        className={`flex w-full items-center justify-center gap-2 text-[10px] transition-transform hover:scale-105 ${
                          isAtivo
                            ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Power size={14} />
                        {isAtivo ? "Desativar jurisdição" : "Ativar jurisdição"}
                      </AdminActionButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-labelledby="municipios-modal-title" className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 id="municipios-modal-title" className="flex items-center gap-2 text-lg font-black text-slate-800">
                <DownloadCloud size={20} className="text-blue-500" />
                Importar Base IBGE
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal de importação de município"
                className="text-slate-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                X
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <AdminFieldLabel htmlFor="municipios-uf">
                  Selecione o estado (UF)
                </AdminFieldLabel>
                <AdminFilterSelect
                  id="municipios-uf"
                  value={ufSelecionada}
                  onChange={(event) => {
                    setUfSelecionada(event.target.value);
                    void carregarCidadesIBGE(event.target.value);
                  }}
                  className="bg-white py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500"
                >
                  {ESTADOS_BR.map((estado) => (
                    <option key={estado.uf} value={estado.uf}>
                      {estado.nome} ({estado.uf})
                    </option>
                  ))}
                </AdminFilterSelect>
              </div>

              <div>
                <AdminFieldLabel htmlFor="municipios-ibge-cidade">
                  Selecione a cidade litorânea
                </AdminFieldLabel>
                {carregandoIBGE ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
                    Sincronizando com IBGE...
                  </div>
                ) : (
                  <AdminFilterSelect
                    id="municipios-ibge-cidade"
                    value={cidadeSelecionadaIBGE}
                    onChange={(event) => setCidadeSelecionadaIBGE(event.target.value)}
                    className="bg-white py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500"
                  >
                    {municipiosIBGE.map((city) => (
                      <option key={city.id} value={city.id.toString()}>
                        {city.nome}
                      </option>
                    ))}
                  </AdminFilterSelect>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-6">
              <AdminActionButton
                type="button"
                onClick={() => void salvarMunicipio()}
                disabled={salvando || carregandoIBGE}
                className="flex w-full items-center justify-center gap-2 bg-slate-900 py-4 text-xs text-blue-400 transition-all hover:scale-105 disabled:hover:scale-100 focus-visible:ring-blue-100"
              >
                {salvando ? "Importando para o BD..." : "Confirmar importação"}
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MunicipiosPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <MunicipiosPageContent />
    </Suspense>
  );
}
