"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  CheckCircle2,
  Download,
  FileSearch,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

import { buildOperationalRows, filterOperationalRows, type OperationalAlertRow } from "@/lib/alert-data";
import { buildWorkforceSummary, exportableWorkforceSummaryRows } from "@/lib/workforce-data";
import { AdminActionButton, AdminFilterSelect, AdminKpiCard, AdminSegmentedTabs, AdminTabButton } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { ErrorState } from "@/components/ui/PageStates";
import { downloadCsv } from "@/lib/csv";
import { FILTER_ALL, FILTER_ALL_FEMININE } from "@/lib/filters";
import { formatDateTime } from "@/lib/formatters";
import { extractNumericStat, useReportsDataQuery } from "@/lib/queries";
import { buildPathWithQueryState } from "@/lib/url-state";
import type { AppBeach } from "@/lib/types";

function RelatoriosPageContent() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const abaQuery = searchParams.get("aba") || "executiva";
  const praiaQuery = searchParams.get("praia") || FILTER_ALL_FEMININE;
  const grauQuery = searchParams.get("grau") || FILTER_ALL;
  const encaminhamentoQuery = searchParams.get("encaminhamento") || FILTER_ALL;
  const abaAtiva: "executiva" | "operacional" = abaQuery === "operacional" ? "operacional" : "executiva";
  const filtroPraia = praiaQuery;
  const filtroGrau = grauQuery;
  const filtroEncaminhamento = encaminhamentoQuery;
  const { data, isError, isLoading: loading, refetch, dataUpdatedAt } = useReportsDataQuery();
  const failedSources = useMemo(() => data?.failedSources || [], [data?.failedSources]);
  const hasPartialFailure = failedSources.length > 0;
  const praiasDisponiveis = useMemo(() => ((data?.beaches || []) as AppBeach[]), [data?.beaches]);
  const workforceSummary = useMemo(
    () =>
      buildWorkforceSummary((data?.users || []), (data?.activeUsers || []), {
        activeUsersSourceFailed: failedSources.includes("usuarios-ativos"),
      }),
    [data?.activeUsers, data?.users, failedSources],
  );
  const kpisExecutivos = useMemo(
    () => ({
      praiasMonitoradas: praiasDisponiveis.length,
      efetivoGV:
        workforceSummary.totalOperationalUsers > 0
          ? workforceSummary.activeOperationalUsers
          : (extractNumericStat(data?.stats || null, "efetivo") ?? 0),
      efetivoTotal: workforceSummary.totalOperationalUsers,
      frotaDisponivel: extractNumericStat(data?.stats || null, "frota") ?? 0,
      vidasSalvasSemana: extractNumericStat(data?.stats || null, "resgates") ?? 0,
      preventivasSemana: extractNumericStat(data?.stats || null, "prevencoes") ?? 0,
    }),
    [data?.stats, praiasDisponiveis.length, workforceSummary.activeOperationalUsers, workforceSummary.totalOperationalUsers],
  );
  const dadosOperacionais = useMemo<OperationalAlertRow[]>(
    () => buildOperationalRows(data?.alerts || [], praiasDisponiveis),
    [data?.alerts, praiasDisponiveis],
  );

  const dadosFiltrados = useMemo(
    () => filterOperationalRows(dadosOperacionais, { praia: filtroPraia, grau: filtroGrau, encaminhamento: filtroEncaminhamento }),
    [dadosOperacionais, filtroEncaminhamento, filtroGrau, filtroPraia],
  );

  function updateFilters(nextValues: {
    aba?: "executiva" | "operacional";
    praia?: string;
    grau?: string;
    encaminhamento?: string;
  }) {
    const nextAba = nextValues.aba || abaAtiva;
    const nextPraia = nextValues.praia ?? filtroPraia;
    const nextGrau = nextValues.grau ?? filtroGrau;
    const nextEncaminhamento = nextValues.encaminhamento ?? filtroEncaminhamento;

    router.replace(
      buildPathWithQueryState("/admin/relatorios", searchParams.toString(), {
        aba: nextAba,
        praia: nextPraia === FILTER_ALL_FEMININE ? null : nextPraia,
        grau: nextGrau === FILTER_ALL ? null : nextGrau,
        encaminhamento: nextEncaminhamento === FILTER_ALL ? null : nextEncaminhamento,
      }),
      { scroll: false },
    );
  }

  function exportarRelatorioOperacional() {
    if (dadosFiltrados.length === 0) {
      showToast({
        tone: "info",
        title: "Sem dados para exportar",
        description: "Ajuste os filtros operacionais para gerar a planilha.",
      });
      return;
    }

    downloadCsv(
      "relatorio_operacional.csv",
      ["ID", "DATA", "PRAIA", "POSTO", "TIPO", "GRAU", "ENCAMINHAMENTO", "VIATURA"],
      dadosFiltrados.map((row) => [
        row.id,
        row.data,
        row.praia,
        row.posto,
        row.tipo,
        row.grau,
        row.encaminhamento,
        row.viatura,
      ]),
    );

    showToast({
      tone: "success",
      title: "Planilha exportada",
      description: "O relatório operacional foi gerado com sucesso.",
    });
  }

  function exportarResumoExecutivo() {
    downloadCsv(
      "resumo_executivo.csv",
      ["INDICADOR", "VALOR"],
      [
        ["Praias monitoradas", kpisExecutivos.praiasMonitoradas],
        ["Poder de frota", kpisExecutivos.frotaDisponivel],
        ["Vidas salvas", kpisExecutivos.vidasSalvasSemana],
        ["Preventivas", kpisExecutivos.preventivasSemana],
        ...exportableWorkforceSummaryRows(workforceSummary),
      ],
    );

    showToast({
      tone: "success",
      title: "Resumo executivo exportado",
      description: "O arquivo CSV com os indicadores principais foi gerado.",
    });
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <ErrorState
          icon={<AlertTriangle size={48} className="text-amber-400" />}
          title="Falha ao carregar relatórios"
          description="Os dados consolidados não puderam ser sincronizados com o backend neste momento."
          surface="dark"
          size="full"
          className="min-h-[50vh] rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl"
          action={<AdminActionButton onClick={() => void refetch()} className="bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-200">Tentar novamente</AdminActionButton>}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      {hasPartialFailure ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Relatório carregado com dados parciais. Fontes indisponíveis: {failedSources.join(", ")}.
        </div>
      ) : null}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]" />

        <div className="relative z-10">
          <h1 className="flex items-center gap-4 text-3xl font-black tracking-tight text-white">
            Relatórios estratégicos
            {loading ? <RefreshCw size={20} className="animate-spin text-indigo-400" /> : null}
          </h1>
          <p className="mt-2 max-w-xl font-medium text-slate-400">
            Análise de dados sincronizada com o banco de dados principal.
          </p>
          {dataUpdatedAt ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              Última sincronização: {formatDateTime(new Date(dataUpdatedAt).toISOString(), "--")}
            </p>
          ) : null}
        </div>

        <div className="relative z-10 flex gap-2">
          <AdminSegmentedTabs>
            <AdminTabButton onClick={() => updateFilters({ aba: "executiva" })} active={abaAtiva === "executiva"}>
              <BarChart3 size={16} /> Visão executiva
            </AdminTabButton>
            <AdminTabButton onClick={() => updateFilters({ aba: "operacional" })} active={abaAtiva === "operacional"}>
              <FileSearch size={16} /> Visão operacional
            </AdminTabButton>
          </AdminSegmentedTabs>
          <AdminActionButton onClick={() => void refetch()} className="border border-slate-700 bg-slate-800 text-xs text-white hover:bg-slate-700 focus-visible:ring-slate-200">
            Atualizar
          </AdminActionButton>
        </div>
      </div>

      {abaAtiva === "executiva" ? (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AdminKpiCard
              label="Praias monitoradas"
              value={kpisExecutivos.praiasMonitoradas}
              icon={<Shield size={80} />}
              footer={<><CheckCircle2 size={14} /> Ativas na API</>}
              className="[&>div:last-child]:bg-emerald-50 [&>div:last-child]:text-emerald-500"
            />

            <AdminKpiCard
              label="Efetivo ativo"
              value={kpisExecutivos.efetivoGV}
              icon={<Users size={80} />}
              footer={<><Users size={14} /> {kpisExecutivos.efetivoTotal} no total</>}
              accent="indigo"
              className="[&>div:last-child]:bg-indigo-50 [&>div:last-child]:text-indigo-500"
            />

            <AdminKpiCard
              label="Poder de frota"
              value={kpisExecutivos.frotaDisponivel}
              icon={<Ambulance size={80} />}
              footer={<>Viaturas, botes e motos</>}
              className="[&>div:last-child]:bg-slate-100 [&>div:last-child]:text-slate-500"
            />

            <AdminKpiCard
              label="Vidas salvas / resgates"
              value={kpisExecutivos.vidasSalvasSemana}
              icon={<Activity size={80} className="text-emerald-500" />}
              footer={<><TrendingUp size={14} /> Dados em tempo real</>}
              accent="indigo"
              dark
              className="[&>div:last-child]:bg-emerald-500/20 [&>div:last-child]:text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Efetividade preventiva</h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">Ações que evitaram o resgate</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">
                    {kpisExecutivos.preventivasSemana.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preventivas</p>
                </div>
              </div>

              <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-indigo-500" style={{ width: kpisExecutivos.preventivasSemana > 0 ? "98%" : "50%" }} />
                <div className="h-full bg-red-500" style={{ width: kpisExecutivos.preventivasSemana > 0 ? "2%" : "50%" }} />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-3xl border border-indigo-500 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-lg">
              <h3 className="text-2xl font-black">Resumo executivo</h3>
              <p className="mb-8 max-w-sm text-sm font-medium text-indigo-100">
                Exporte um resumo enxuto com os indicadores principais da operação.
              </p>
              <AdminActionButton type="button" onClick={exportarResumoExecutivo} className="flex w-fit items-center justify-center gap-3 bg-white text-sm text-indigo-700 shadow-xl hover:bg-slate-100 focus-visible:ring-indigo-100">
                <Download size={18} /> Exportar resumo CSV
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {abaAtiva === "operacional" ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-in slide-in-from-right-4 duration-300">
          <div className="border-b border-slate-100 bg-slate-50/80 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800">
              <FileSearch size={16} className="text-indigo-500" /> Filtros operacionais cruzados
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="relatorios-praia" className="text-[10px] font-bold uppercase text-slate-500">Localização (praia)</label>
                <AdminFilterSelect id="relatorios-praia" value={filtroPraia} onChange={(e) => updateFilters({ praia: e.target.value })} className="py-3 text-xs text-slate-700 focus:border-indigo-500">
                  <option value={FILTER_ALL_FEMININE}>Todas as praias</option>
                  {praiasDisponiveis.map((praia) => (
                    <option key={praia.id} value={praia.name}>
                      {praia.name}
                    </option>
                  ))}
                </AdminFilterSelect>
              </div>

              <div className="space-y-2">
                <label htmlFor="relatorios-grau" className="text-[10px] font-bold uppercase text-slate-500">Filtro de grau</label>
                <AdminFilterSelect id="relatorios-grau" value={filtroGrau} onChange={(e) => updateFilters({ grau: e.target.value })} className="py-3 text-xs text-slate-700 focus:border-indigo-500">
                  <option value={FILTER_ALL}>Todos os registros</option>
                  <option value="Grave">Casos graves</option>
                  <option value="Normal">Casos normais</option>
                </AdminFilterSelect>
              </div>

              <div className="space-y-2">
                <label htmlFor="relatorios-encaminhamento" className="text-[10px] font-bold uppercase text-slate-500">Destino final</label>
                <AdminFilterSelect id="relatorios-encaminhamento" value={filtroEncaminhamento} onChange={(e) => updateFilters({ encaminhamento: e.target.value })} className="py-3 text-xs text-slate-700 focus:border-indigo-500">
                  <option value={FILTER_ALL}>Qualquer destino</option>
                  <option value="Resolvido no local">Resolvido no local</option>
                  <option value="Acompanhamento">Acompanhamento</option>
                </AdminFilterSelect>
              </div>

              <div className="flex items-end">
                <AdminActionButton onClick={exportarRelatorioOperacional} className="flex h-[48px] w-full items-center justify-center gap-2 bg-slate-900 text-xs text-white hover:bg-slate-800 focus-visible:ring-slate-200">
                  <Download size={14} /> Exportar planilha
                </AdminActionButton>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-20">
                <RefreshCw size={32} className="animate-spin text-indigo-300" />
              </div>
            ) : (
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="border-b border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Local</th>
                    <th className="px-6 py-4">Ocorrência</th>
                    <th className="px-6 py-4">Desfecho / destino</th>
                    <th className="px-6 py-4">Recurso acionado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosFiltrados.length > 0 ? (
                    dadosFiltrados.map((row) => (
                      <tr key={row.id} className="group transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">AL-{row.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-500">{row.data}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{row.praia}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">{row.posto}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className={row.grau === "Grave" ? "text-red-500" : "text-blue-500"} />
                            <span className="font-bold text-slate-800">{row.tipo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                              row.encaminhamento === "Resolvido no local"
                                ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                : "border border-orange-100 bg-orange-50 text-orange-600"
                            }`}
                          >
                            {row.encaminhamento}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-500">{row.viatura}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                        <FileSearch size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="font-bold">Nenhum registro de alerta retornado pela API.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <RelatoriosPageContent />
    </Suspense>
  );
}
