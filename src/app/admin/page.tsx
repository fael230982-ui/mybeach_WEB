"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  Download,
  Filter,
  Flag,
  Flame,
  LifeBuoy,
  ShieldAlert,
  ShieldPlus,
} from "lucide-react";
import { AdminActionButton, AdminFilterSelect, InlineMetric } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import {
  buildAlertDailyFrequency,
  buildAlertStats,
  buildHotZones,
  exportableAlertRow,
  filterAlerts,
  listRecentAlerts,
} from "@/lib/alert-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FILTER_ALL } from "@/lib/filters";
import { isActiveAlert, isPendingAlert } from "@/lib/alerts";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/formatters";
import { useDashboardQuery } from "@/lib/queries";
import { buildPathWithQueryState } from "@/lib/url-state";
import { buildWorkforceSummary } from "@/lib/workforce-data";
import type { AppAlert, AppPost, AppZone, AppUser } from "@/lib/types";

function DashboardPageContent() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodoQuery = searchParams.get("periodo") || "hoje";
  const statusQuery = searchParams.get("status") || FILTER_ALL.toLowerCase();
  const filtroPeriodo = ["hoje", "7dias", "30dias", "todos"].includes(periodoQuery) ? periodoQuery : "hoje";
  const filtroStatus =
    [FILTER_ALL.toLowerCase(), "ativos", "resolvidos"].includes(statusQuery)
      ? statusQuery
      : FILTER_ALL.toLowerCase();
  const { data, isError, isLoading: carregando, refetch, dataUpdatedAt } = useDashboardQuery();
  const { alertasRaw, posts, zones, users } = useMemo(
    () => ({
      alertasRaw: (data?.alerts || []) as AppAlert[],
      posts: (data?.posts || []) as AppPost[],
      zones: (data?.zones || []) as AppZone[],
      users: (data?.users || []) as AppUser[],
    }),
    [data],
  );
  const activeUsers = useMemo(() => (data?.activeUsers || []) as AppUser[], [data?.activeUsers]);
  const failedSources = useMemo(() => data?.failedSources || [], [data?.failedSources]);
  const hasPartialFailure = failedSources.length > 0;
  const workforceSummary = useMemo(
    () =>
      buildWorkforceSummary(users, activeUsers, {
        activeUsersSourceFailed: failedSources.includes("usuarios-ativos"),
      }),
    [activeUsers, failedSources, users],
  );
  const statsFixos = useMemo(() => {
    const praiasComPosto = new Set(posts.map((posto) => posto.beach_id).filter(Boolean));

    return {
      postos: posts.length,
      zonas: zones.length,
      agentes: workforceSummary.totalOperationalUsers,
      agentesAtivos: workforceSummary.activeOperationalUsers,
      praiasGuarnecidas: praiasComPosto.size,
    };
  }, [posts, workforceSummary.activeOperationalUsers, workforceSummary.totalOperationalUsers, zones]);

  const alertasFiltrados = useMemo(
    () => filterAlerts(alertasRaw, { period: filtroPeriodo as "hoje" | "7dias" | "30dias" | "todos", status: filtroStatus as "todos" | "ativos" | "resolvidos" }),
    [alertasRaw, filtroPeriodo, filtroStatus],
  );

  const statsFiltrados = useMemo(() => buildAlertStats(alertasFiltrados), [alertasFiltrados]);

  const ultimasOcorrencias = useMemo(() => listRecentAlerts(alertasFiltrados, 6), [alertasFiltrados]);

  const zonasQuentes = useMemo(() => buildHotZones(alertasFiltrados, 5), [alertasFiltrados]);

  const dadosGrafico = useMemo(() => buildAlertDailyFrequency(alertasFiltrados, { days: 7 }), [alertasFiltrados]);

  function updateFilters(nextPeriodo: string, nextStatus: string) {
    router.replace(
      buildPathWithQueryState("/admin", searchParams.toString(), {
        periodo: nextPeriodo,
        status: nextStatus,
      }),
      { scroll: false },
    );
  }

  const exportarCSV = () => {
    if (alertasFiltrados.length === 0) {
      showToast({ tone: "info", title: "Sem dados para exportar", description: "Ajuste os filtros para gerar um CSV." });
      return;
    }

    downloadCsv(
      `relatorio_ocorrencias_${filtroPeriodo}.csv`,
      ["ID", "DATA", "HORA", "PRAIA", "STATUS", "CIDADAO", "BATERIA", "VIATURA"],
      alertasFiltrados.map(exportableAlertRow),
    );

    showToast({ tone: "success", title: "CSV exportado", description: `Arquivo relatorio_ocorrencias_${filtroPeriodo}.csv gerado com sucesso.` });
  };

  if (carregando) {
    return <LoadingState label="Sincronizando banco de dados..." surface="dark" size="full" className="rounded-3xl border border-slate-700 bg-slate-900 shadow-xl" />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 shadow-xl">
          <ErrorState
            surface="dark"
            size="full"
            title="Falha ao carregar o dashboard"
            description="A API não respondeu com os dados operacionais consolidados. Tente sincronizar novamente."
            action={<AdminActionButton onClick={() => void refetch()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-200">Recarregar painel</AdminActionButton>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] animate-in fade-in duration-500 p-6">
      {hasPartialFailure ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Parte do painel foi carregada com dados incompletos. Fontes indisponíveis: {failedSources.join(", ")}.
        </div>
      ) : null}
      <div className="mb-8 flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:p-6 xl:flex-row xl:items-center">
        <div className="flex w-full min-w-0 items-center gap-4">
          <div className="rounded-2xl border border-blue-500 bg-blue-600 p-4 shadow-lg">
            <Activity size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Tela de Monitoramento</h1>
            <p className="mt-1 text-sm font-medium text-slate-300">Visão global da operação</p>
            {dataUpdatedAt ? (
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Última sincronização: {formatDateTime(new Date(dataUpdatedAt).toISOString(), "--")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto xl:justify-end">
          <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-600 bg-slate-800 p-2 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
            <div className="flex items-center gap-2 px-3 text-slate-300">
              <Filter size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Filtros</span>
            </div>
            <label htmlFor="dashboard-periodo" className="sr-only">
              Filtrar dashboard por período
            </label>
            <AdminFilterSelect id="dashboard-periodo" className="cursor-pointer border-slate-500 bg-slate-700 py-2 text-xs text-white hover:border-cyan-400 sm:w-auto" value={filtroPeriodo} onChange={(event) => updateFilters(event.target.value, filtroStatus)}>
              <option value="hoje">Hoje</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="todos">Todo o histórico</option>
            </AdminFilterSelect>
            <label htmlFor="dashboard-status" className="sr-only">
              Filtrar dashboard por status
            </label>
            <AdminFilterSelect id="dashboard-status" className="cursor-pointer border-slate-500 bg-slate-700 py-2 text-xs text-white hover:border-cyan-400 sm:w-auto" value={filtroStatus} onChange={(event) => updateFilters(filtroPeriodo, event.target.value)}>
              <option value={FILTER_ALL.toLowerCase()}>Todos os Status</option>
              <option value="ativos">Apenas ativos</option>
              <option value="resolvidos">Apenas resolvidos</option>
            </AdminFilterSelect>
          </div>
          <AdminActionButton type="button" onClick={exportarCSV} className="flex w-full items-center justify-center gap-2 border border-emerald-500 bg-emerald-600 text-xs text-white shadow-lg hover:bg-emerald-500 focus-visible:ring-emerald-200 sm:w-auto">
            <Download size={16} /> Exportar
          </AdminActionButton>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InlineMetric label="Total filtrado" value={statsFiltrados.total} icon={<ShieldAlert size={20} />} />
        <div className={`flex items-center justify-between rounded-2xl border p-5 shadow-lg transition-colors ${statsFiltrados.ativos > 0 ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "border-slate-600 bg-slate-800"}`}><div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-400">Ocorrências ativas</p><p className={`text-3xl font-black ${statsFiltrados.ativos > 0 ? "animate-pulse text-red-500" : "text-white"}`}>{statsFiltrados.ativos}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white"><AlertTriangle size={24} /></div></div>
        <InlineMetric label="Resolvidos" value={statsFiltrados.resolvidos} icon={<CheckCircle size={20} />} />
        <InlineMetric label="Falsos alarmes" value={statsFiltrados.falsos} icon={<Crosshair size={20} />} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex h-[320px] flex-col rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl lg:col-span-2">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white">Frequência semanal</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#1e293b" }} contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px" }} />
                <Bar dataKey="Ocorrencias" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex h-[320px] flex-col rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white">Status Operacional</h2>
          <div className="flex flex-1 flex-col justify-center space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-600 p-2 text-white"><LifeBuoy size={20} /></div><div><p className="text-xs font-bold uppercase tracking-widest text-white">Efetivo ativo</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ping nos últimos 15 min</p></div></div><p className="text-2xl font-black text-emerald-400">{statsFixos.agentesAtivos}</p></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-950 p-2 text-white"><ShieldPlus size={20} /></div><p className="text-xs font-bold uppercase tracking-widest text-white">Efetivo total</p></div><p className="text-2xl font-black text-white">{statsFixos.agentes}</p></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-600 p-2 text-white"><ShieldPlus size={20} /></div><p className="text-xs font-bold uppercase tracking-widest text-white">Postos</p></div><p className="text-2xl font-black text-white">{statsFixos.postos}</p></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-cyan-600 p-2 text-white"><Flag size={20} /></div><p className="text-xs font-bold uppercase tracking-widest text-white">Zonas</p></div><p className="text-2xl font-black text-white">{statsFixos.zonas}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex min-h-[350px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-700 bg-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-sm font-black uppercase tracking-widest text-white">Feed em tempo real</h2><AdminActionButton onClick={() => router.push("/admin/ocorrencias")} size="compact" className="self-start bg-slate-700 text-[10px] text-cyan-400 hover:bg-slate-600 sm:self-auto">Abrir fichas</AdminActionButton></div>
          <div className="flex-1 overflow-y-auto p-3">
            {ultimasOcorrencias.length === 0 ? <EmptyState icon={<CheckCircle size={32} className="text-slate-400" />} title="Nenhuma ocorrência neste filtro" surface="dark" size="compact" className="h-full" /> : ultimasOcorrencias.map((alerta) => (
              <div key={alerta.id} className="mb-2 flex flex-col gap-3 rounded-xl border border-transparent bg-slate-900/50 p-3 transition-colors hover:border-slate-600 hover:bg-slate-700/50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${isActiveAlert(alerta.status) ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-emerald-500"} ${isPendingAlert(alerta.status) ? "animate-pulse" : ""}`} />
                  <div>
                    <p className="text-sm font-bold text-white">{alerta.beach_name || alerta.location_name || "Coordenada Externa"}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-400"><span className="text-cyan-500">Solicitante:</span> {alerta.user_name || "Anônimo"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start text-left sm:items-end sm:text-right">
                  <p className="mb-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300">{formatDateTime(alerta.created_at, "").split(", ")[1] || "--:--"}</p>
                  <button type="button" onClick={() => router.push(`/admin/mapa?focus=${alerta.id}`)} className="flex items-center gap-1 text-[10px] font-black uppercase text-cyan-400 transition-colors hover:text-cyan-300"><Crosshair size={12} /> Mapa tático</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-full min-h-[350px] flex-col rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-2"><div className="rounded-lg bg-orange-500/20 p-2"><Flame size={20} className="text-orange-500" /></div><h2 className="text-sm font-black uppercase tracking-widest text-white">Zonas quentes <span className="ml-1 text-[10px] text-slate-400">(Top 5)</span></h2></div>
          <div className="flex flex-1 flex-col justify-center space-y-3">
            {zonasQuentes.length === 0 ? <EmptyState title="Sem dados no período" surface="dark" size="compact" /> : zonasQuentes.map((local, index) => (
              <div key={local.nome} className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-3.5 shadow-sm">
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${index === 0 ? "bg-orange-500" : index === 1 ? "bg-amber-500" : "bg-slate-600"}`} />
                <p className="max-w-[150px] truncate pl-2 text-xs font-bold text-white" title={local.nome}>{local.nome}</p>
                <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase text-slate-400">Acionamentos</span><span className={`rounded-md px-2 py-0.5 text-sm font-black ${index === 0 ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-300"}`}>{local.count}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <DashboardPageContent />
    </Suspense>
  );
}
