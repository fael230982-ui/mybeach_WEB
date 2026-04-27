"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Download, MapPin, Radio, ShieldAlert, Users } from "lucide-react";

import { AdminActionButton, AdminKpiCard, AdminStatusBadge } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { formatLastPing } from "@/lib/activity";
import { downloadCsv } from "@/lib/csv";
import { useWorkforceQuery } from "@/lib/queries";
import { buildWorkforceSummary, exportableWorkforceSummaryRows } from "@/lib/workforce-data";

function EfetivoPageContent() {
  const { data, isError, isLoading, refetch } = useWorkforceQuery();
  const failedSources = useMemo(() => data?.failedSources || [], [data?.failedSources]);
  const hasPartialFailure = failedSources.length > 0;
  const summary = useMemo(
    () =>
      buildWorkforceSummary((data?.users || []), (data?.activeUsers || []), {
        activeUsersSourceFailed: failedSources.includes("usuarios-ativos"),
      }),
    [data?.activeUsers, data?.users, failedSources],
  );
  const recentUsers = useMemo(() => {
    const activeUsers = data?.activeUsers || [];

    return activeUsers.slice(0, 6).map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      city: user.city_name || "Sem cidade",
      ping: formatLastPing(user.last_ping),
    }));
  }, [data?.activeUsers]);

  function exportarEfetivo() {
    downloadCsv(
      "efetivo_operacional.csv",
      ["INDICADOR", "VALOR"],
      [
        ...exportableWorkforceSummaryRows(summary),
        ...recentUsers.map((user) => [`Ativo recente - ${user.name}`, `${user.role} | ${user.city} | ${user.ping}`]),
      ],
    );
  }

  if (isLoading) {
    return <LoadingState label="Sincronizando efetivo operacional..." size="full" className="rounded-3xl border border-slate-200 bg-white shadow-sm" />;
  }

  if (isError && !data) {
    return (
      <ErrorState
        icon={<ShieldAlert size={48} className="text-amber-500" />}
        title="Falha ao carregar efetivo"
        description="A API não respondeu com os usuários operacionais neste momento."
        size="full"
        className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        action={<AdminActionButton onClick={() => void refetch()}>Tentar novamente</AdminActionButton>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
      {hasPartialFailure ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Parte do efetivo foi carregada com dados parciais. Fontes indisponíveis: {failedSources.join(", ")}.
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <AdminStatusBadge tone="info" icon={<Radio size={14} />} className="rounded-full px-3 py-1 text-xs">
              Leitura operacional ativa
            </AdminStatusBadge>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Efetivo operacional</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600">
                Painel consolidado a partir de usuários cadastrados e ativos recentes documentados pela nova API.
              </p>
            </div>
          </div>

          <Link href="/admin/usuarios" className="contents">
            <AdminActionButton className="inline-flex items-center gap-2 bg-slate-900 text-sm normal-case tracking-normal text-white hover:bg-slate-800">
              Gerenciar acessos
              <ArrowRight size={16} />
            </AdminActionButton>
          </Link>
          <AdminActionButton onClick={exportarEfetivo} className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-sm normal-case tracking-normal text-emerald-700 hover:bg-emerald-100">
            <Download size={16} />
            Exportar CSV
          </AdminActionButton>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Efetivo ativo" value={summary.activeOperationalUsers} icon={<Activity size={80} />} footer={<>Últimos 15 min</>} accent="emerald" className="[&>div:last-child]:bg-emerald-50 [&>div:last-child]:text-emerald-600" />
        <AdminKpiCard label="Efetivo total" value={summary.totalOperationalUsers} icon={<Users size={80} />} footer={<>Usuários operacionais</>} accent="indigo" className="[&>div:last-child]:bg-indigo-50 [&>div:last-child]:text-indigo-600" />
        <AdminKpiCard label="Cobertura ativa" value={`${summary.activeCoverage}%`} icon={<ShieldAlert size={80} />} footer={<>Base operacional</>} className="[&>div:last-child]:bg-slate-100 [&>div:last-child]:text-slate-600" />
        <AdminKpiCard label="Usuários totais" value={summary.totalUsers} icon={<Users size={80} />} footer={<>Inclui perfis não operacionais</>} className="[&>div:last-child]:bg-slate-100 [&>div:last-child]:text-slate-600" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Distribuição por função</h2>
              <p className="text-sm text-slate-500">Agrupamento dos perfis operacionais consumidos pelo admin.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {summary.byRole.length === 0 ? (
              <EmptyState title="Sem efetivo operacional" description="Não há usuários suficientes para consolidar esta visão." size="compact" />
            ) : (
              summary.byRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">{item.role}</span>
                  <span className="text-lg font-black text-slate-900">{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm">
          <h2 className="text-lg font-black">Ativos recentes</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Usuários retornados pelo endpoint de ativos ou deduzidos por `last_ping` recente quando essa fonte falha.
          </p>

          <div className="mt-6 space-y-3">
            {recentUsers.length === 0 ? (
              <EmptyState title="Sem ativos recentes" description="Nenhum operador ativo foi identificado neste momento." surface="dark" size="compact" />
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">{user.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{user.role}</p>
                    </div>
                    <AdminStatusBadge tone="success" size="compact">Online</AdminStatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {user.city}</span>
                    <span className="inline-flex items-center gap-1"><Radio size={12} /> {user.ping}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">Cobertura por cidade</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.byCity.length === 0 ? (
            <EmptyState title="Sem cidades consolidadas" description="Os usuários ainda não retornaram cidade suficiente para este agrupamento." size="compact" className="md:col-span-2 xl:col-span-3" />
          ) : (
            summary.byCity.map((item) => (
              <div key={item.city} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-800">{item.city}</p>
                <p className="mt-1 text-xs text-slate-500">Operadores vinculados</p>
                <p className="mt-3 text-2xl font-black text-slate-900">{item.total}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function EfetivoPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <EfetivoPageContent />
    </Suspense>
  );
}
