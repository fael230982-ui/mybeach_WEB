"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Download, Edit3, Filter, MapPin, Plus, Power, Search, ShieldPlus, Trash2 } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { AdminActionButton, AdminFieldLabel, AdminFilterSelect, AdminIconButton, AdminSearchInput, AdminStatusBadge } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { exportablePostRows } from "@/lib/catalog-export";
import { filterPostCatalog, normalizePostStatus } from "@/lib/catalog-data";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { FILTER_ALL_FEMININE } from "@/lib/filters";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useBeachesQuery, usePostsQuery } from "@/lib/queries";
import { postFormSchema } from "@/lib/schemas";
import { filterBeachesByCity, getOperationalBeachCenter } from "@/lib/territory-data";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike, AppBeach, AppPost, LatLngTuple } from "@/lib/types";

const MapaPostoDinamico = dynamic(() => import("./MapaPostoClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">
      Iniciando satélite de alta resolução...
    </div>
  ),
});

function PostosPageContent() {
  const { confirm, showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const cityFromQuery = searchParams.get("cidade");
  const [busca, setBusca] = useState("");
  const [filtroPraia, setFiltroPraia] = useState(FILTER_ALL_FEMININE);
  const [cidadeUrlParam, setCidadeUrlParam] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [praiaSelecionada, setPraiaSelecionada] = useState("");
  const [nomePosto, setNomePosto] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [raio, setRaio] = useState("500");
  const [salvando, setSalvando] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
  const { data: praiasData = [], isError: isBeachesError, isLoading: praiasLoading, refetch: refetchBeaches } = useBeachesQuery();
  const { data: postosData = [], isError: isPostsError, isLoading: postosLoading, refetch: refetchPosts } = usePostsQuery();
  const carregando = praiasLoading || postosLoading;
  const hasError = isBeachesError || isPostsError;
  const praiasAtivas = praiasData as AppBeach[];
  const postosSalvos = useMemo(() => normalizePostStatus(postosData as AppPost[]), [postosData]);

  useEffect(() => {
    setCidadeUrlParam(cityFromQuery);
  }, [cityFromQuery]);

  const voarParaPraia = (praia: AppBeach) => {
    const center = getOperationalBeachCenter(praia);
    if (center) {
      setMapCenter(center);
    }
  };

  const handleSelecionarPraia = (id: string) => {
    setPraiaSelecionada(id);
    setLatitude("");
    setLongitude("");
    const praia = praiasAtivas.find((item) => String(item.id) === String(id));
    if (praia) {
      voarParaPraia(praia);
    }
  };

  const salvarPosto = async () => {
    const parsed = postFormSchema.safeParse({
      name: nomePosto,
      beach_id: praiaSelecionada,
      latitude,
      longitude,
      radius: raio,
    });

    if (!parsed.success) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: parsed.error.issues[0]?.message || "Preencha todos os campos e marque o local no mapa.",
      });
      return;
    }

    setSalvando(true);
    const payload = parsed.data;

    try {
      if (editandoId) {
        await apiFetch(`/posts/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/posts", { method: "POST", body: JSON.stringify(payload) });
      }
      fecharModal();
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showToast({
        tone: "success",
        title: editandoId ? "Posto atualizado" : "Posto criado",
        description: `${nomePosto} foi salvo com sucesso.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-postos:save", error);
      showToast({
        tone: "error",
        title: "Falha ao salvar posto",
        description: extractApiErrorMessage(error, "A API recusou o cadastro ou a atualização do posto."),
      });
    } finally {
      setSalvando(false);
    }
  };

  const excluirPosto = async (posto: AppPost) => {
    const accepted = await confirm({
      title: `Excluir posto ${posto.name}?`,
      description: "Essa ação remove o posto da operação.",
      confirmLabel: "Excluir posto",
      tone: "danger",
    });

    if (!accepted) {
      return;
    }
    try {
      await apiFetch(`/posts/${posto.id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showToast({
        tone: "success",
        title: "Posto excluído",
        description: `${posto.name} foi removido com sucesso.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-postos:delete", error, { postId: posto.id });
      showToast({
        tone: "error",
        title: "Falha ao excluir posto",
        description: extractApiErrorMessage(error, "A API não confirmou a exclusão do posto."),
      });
    }
  };

  const toggleStatusPosto = async (posto: AppPost) => {
    const novoStatus = posto.status === "ATIVO" ? "INATIVO" : "ATIVO";
    const accepted = await confirm({
      title: `${novoStatus === "ATIVO" ? "Ativar" : "Desativar"} posto ${posto.name}?`,
      description: `O posto será marcado como ${novoStatus.toLowerCase()}.`,
      confirmLabel: "Confirmar",
      tone: "primary",
    });

    if (!accepted) {
      return;
    }
    try {
      await apiFetch(`/posts/${posto.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus, is_active: novoStatus === "ATIVO" }),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showToast({
        tone: "success",
        title: "Status atualizado",
        description: `${posto.name} agora está ${novoStatus.toLowerCase()}.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-postos:toggle-status", error, { postId: posto.id, nextStatus: novoStatus });
      showToast({
        tone: "error",
        title: "Falha ao alterar status",
        description: extractApiErrorMessage(error, "A API não confirmou a atualização do posto."),
      });
    }
  };

  const praiasParaDropdown = useMemo(() => {
    const lista = cidadeUrlParam ? filterBeachesByCity(praiasAtivas, cidadeUrlParam) : [...praiasAtivas];
    return lista.sort((a, b) => a.name.localeCompare(b.name));
  }, [cidadeUrlParam, praiasAtivas]);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setNomePosto("");
    setLatitude("");
    setLongitude("");
    setRaio("500");
    if (praiasParaDropdown.length > 0) {
      const praia = praiasParaDropdown[0];
      setPraiaSelecionada(String(praia.id));
      voarParaPraia(praia);
    }
    setIsModalOpen(true);
  };

  const abrirModalEditar = (posto: AppPost) => {
    setEditandoId(posto.id);
    setNomePosto(posto.name);
    setPraiaSelecionada(String(posto.beach_id));
    setLatitude(posto.latitude?.toString() || "");
    setLongitude(posto.longitude?.toString() || "");
    setRaio(posto.radius?.toString() || "500");

    if (posto.latitude && posto.longitude) {
      setMapCenter([Number(posto.latitude), Number(posto.longitude)]);
    } else {
      const praia = praiasAtivas.find((item) => String(item.id) === String(posto.beach_id));
      if (praia) {
        voarParaPraia(praia);
      }
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroPraia(FILTER_ALL_FEMININE);
    setCidadeUrlParam(null);
  };

  const postosFiltrados = useMemo(
    () =>
      filterPostCatalog({
        posts: postosSalvos,
        beaches: praiasAtivas,
        cityFilter: cidadeUrlParam,
        beachFilter: filtroPraia,
        search: busca,
      }),
    [busca, cidadeUrlParam, filtroPraia, postosSalvos, praiasAtivas],
  );

  function exportarPostos() {
    downloadCsv(
      "postos.csv",
      ["POSTO", "PRAIA", "STATUS", "LATITUDE", "LONGITUDE", "RAIO"],
      exportablePostRows(postosFiltrados, praiasAtivas),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A lista atual de postos foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/postos?${searchParams.toString()}` : "/admin/postos";
    const nextPath = buildPathWithQueryState("/admin/postos", searchParams.toString(), {
      cidade: cidadeUrlParam,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [cidadeUrlParam, router, searchParams]);

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-red-500/10 blur-[80px]" />
        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              Torres e Postos GV
              {carregando ? <span className="h-2.5 w-2.5 animate-ping rounded-full bg-red-500" /> : null}
            </h1>
            <p className="mt-1 text-xs text-slate-400">Geolocalização tática das bases de salvamento</p>
          </div>
          <AdminActionButton onClick={abrirModalNovo} className="flex items-center gap-2 bg-red-500 text-white shadow-lg hover:bg-red-600 focus-visible:ring-red-200">
            <Plus size={16} /> Novo Posto GV
          </AdminActionButton>
          <AdminActionButton onClick={exportarPostos} className="flex items-center gap-2 border border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-200">
            <Download size={16} /> Exportar CSV
          </AdminActionButton>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <label htmlFor="postos-busca" className="sr-only">
              Buscar posto por nome ou praia
            </label>
            <AdminSearchInput
              icon={Search}
              id="postos-busca"
              type="text"
              placeholder="Buscar posto ou praia..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="focus:border-red-500 focus:ring-red-500/10"
            />
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row md:w-auto md:items-center">
            <div className="flex-1 md:flex-none">
              <label htmlFor="postos-praia" className="sr-only">
                Filtrar postos por praia
              </label>
              <AdminFilterSelect
                leadingIcon={Filter}
                id="postos-praia"
                value={filtroPraia}
                onChange={(event) => setFiltroPraia(event.target.value)}
                className="cursor-pointer focus:border-red-500 sm:min-w-[220px] md:w-auto"
              >
                <option value={FILTER_ALL_FEMININE}>Todas as Praias</option>
                {praiasParaDropdown.map((praia) => (
                  <option key={praia.id} value={String(praia.id)}>{praia.name}</option>
                ))}
              </AdminFilterSelect>
            </div>
            {busca || filtroPraia !== FILTER_ALL_FEMININE || cidadeUrlParam ? (
              <AdminActionButton type="button" tone="light" size="compact" onClick={limparFiltros} className="bg-red-50 text-[10px] text-red-500 hover:bg-red-100">Limpar filtro</AdminActionButton>
            ) : null}
          </div>
        </div>

        <div className="flex-1 p-6">
          {carregando ? (
            <LoadingState label="Carregando postos de salvamento..." size="compact" />
          ) : hasError ? (
            <ErrorState
              icon={<AlertTriangle size={48} className="text-amber-400" />}
              title="Falha ao carregar postos"
              description="Não foi possível sincronizar postos e praias neste momento."
              size="compact"
              action={
                <AdminActionButton
                  onClick={() => {
                    void refetchPosts();
                    void refetchBeaches();
                  }}
                >
                  Tentar novamente
                </AdminActionButton>
              }
            />
          ) : postosFiltrados.length === 0 ? (
            <EmptyState
              icon={<ShieldPlus size={48} className="text-slate-400" />}
              title="Nenhum posto encontrado"
              description="Ajuste os filtros ou cadastre um novo posto tático."
              size="compact"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {postosFiltrados.map((posto) => {
                const praia = praiasAtivas.find((item) => String(item.id) === String(posto.beach_id));
                const isAtivo = posto.status === "ATIVO";

                return (
                  <div key={posto.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${!isAtivo ? "grayscale-[0.3] opacity-60" : "hover:border-red-300"}`}>
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${isAtivo ? "border-red-100 bg-red-50 text-red-600" : "border-slate-200 bg-slate-100 text-slate-400"}`}><ShieldPlus size={24} /></div>
                      <AdminStatusBadge tone={isAtivo ? "success" : "neutral"} size="compact">{isAtivo ? "OPERANTE" : "INATIVO"}</AdminStatusBadge>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-800">{posto.name}</h3>
                    <p className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-400"><MapPin size={12} /> {praia?.name || "Desconhecida"}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
                      <AdminActionButton type="button" tone="light" size="compact" onClick={() => void toggleStatusPosto(posto)} className={`flex items-center gap-2 text-[10px] transition-transform hover:scale-105 ${isAtivo ? "border-amber-200 bg-amber-50 text-amber-600" : "border-emerald-200 bg-emerald-50 text-emerald-600"}`}><Power size={14} /> {isAtivo ? "DESATIVAR" : "ATIVAR"}</AdminActionButton>
                      <div className="flex gap-2">
                        <AdminIconButton aria-label={`Editar posto ${posto.name}`} onClick={() => abrirModalEditar(posto)} className="p-2 hover:text-red-600"><Edit3 size={14} /></AdminIconButton>
                        <AdminIconButton aria-label={`Excluir posto ${posto.name}`} onClick={() => void excluirPosto(posto)} className="p-2 hover:text-red-600"><Trash2 size={14} /></AdminIconButton>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="postos-modal-title" className="flex max-h-[95vh] w-full max-w-[95vw] flex-col rounded-3xl bg-white shadow-2xl 2xl:max-w-[1400px]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 id="postos-modal-title" className="flex items-center gap-3 text-2xl font-black text-slate-800"><ShieldPlus size={28} className="text-red-500" /> {editandoId ? "Editar Posto" : "Novo Posto Tático"}</h3>
              <AdminIconButton type="button" onClick={fecharModal} aria-label="Fechar modal de posto" className="border-transparent text-slate-400 shadow-none hover:text-red-500">X</AdminIconButton>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-4 lg:gap-8">
              <div className="space-y-6 lg:col-span-1">
                <div>
                  <AdminFieldLabel htmlFor="posto-praia" className="mb-2 ml-0">1. Escolha a Praia</AdminFieldLabel>
                  <AdminFilterSelect id="posto-praia" value={praiaSelecionada} onChange={(event) => handleSelecionarPraia(event.target.value)} className="bg-slate-50 py-4 text-sm text-slate-700 focus:border-red-500">
                    {praiasParaDropdown.map((praia) => <option key={praia.id} value={String(praia.id)}>{praia.name}</option>)}
                  </AdminFilterSelect>
                </div>
                <div>
                  <AdminFieldLabel htmlFor="posto-nome" className="mb-2 ml-0">2. Nome do Posto</AdminFieldLabel>
                  <input id="posto-nome" type="text" placeholder="Ex: Posto 4" value={nomePosto} onChange={(event) => setNomePosto(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none transition-colors focus:border-red-500 focus-visible:ring-4 focus-visible:ring-red-100" />
                </div>
                {latitude && longitude ? <div aria-live="polite" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">Coordenadas gravadas</p><div className="space-y-1 font-mono text-sm font-bold text-slate-700"><p>LAT: {Number.parseFloat(latitude).toFixed(6)}</p><p>LNG: {Number.parseFloat(longitude).toFixed(6)}</p></div></div> : null}
              </div>

              <div className="flex flex-col lg:col-span-3">
                <label className="mb-3 flex flex-col gap-2 text-xs font-black uppercase tracking-widest text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>3. Localização Tática (Satélite)</span><span className="rounded-lg bg-red-50 px-3 py-1 text-red-500">Clique na areia para marcar</span></label>
                <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border-2 border-slate-200 shadow-inner focus-within:border-red-500 sm:h-[420px] lg:h-[650px]">
                  <MapaPostoDinamico lat={latitude} lng={longitude} setLat={setLatitude} setLng={setLongitude} mapCenter={mapCenter} />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-6">
              <button onClick={() => void salvarPosto()} disabled={salvando} className="w-full rounded-2xl bg-slate-900 py-5 text-base font-black uppercase tracking-widest text-red-400 shadow-xl transition-all hover:bg-slate-800 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100">
                {salvando ? "Salvando base..." : "Confirmar localização do posto"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PostosPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <PostosPageContent />
    </Suspense>
  );
}
