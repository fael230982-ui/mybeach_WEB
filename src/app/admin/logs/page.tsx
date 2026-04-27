"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Download, Terminal } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { AdminActionButton } from "@/components/ui/AdminControls";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/formatters";
import { exportableAuditLogRows } from "@/lib/log-data";
import { useLogsQuery } from "@/lib/queries";

export default function LogsPage() {
  const router = useRouter();
  const { data: logs = [], isLoading: loading, isError, refetch, dataUpdatedAt, isFetching } = useLogsQuery();

  function exportarLogs() {
    downloadCsv(
      "logs_auditoria.csv",
      ["DATA_HORA", "ACAO", "USUARIO", "IP", "STATUS"],
      exportableAuditLogRows(logs),
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-red-500/10 blur-[80px]" />
        <div className="relative z-10 flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              <Terminal size={24} className="text-slate-400" />
              Logs do sistema
              {loading ? <span className="h-2 w-2 animate-ping rounded-full bg-red-500" /> : null}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Auditoria de acessos e ações do painel de comando
            </p>
            {dataUpdatedAt ? (
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Última sincronização: {formatDateTime(new Date(dataUpdatedAt).toISOString(), "--")}
              </p>
            ) : null}
          </div>
          <div className="flex gap-3">
            <AdminActionButton type="button" onClick={exportarLogs} className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-100">
              <Download size={16} /> Exportar CSV
            </AdminActionButton>
            <AdminActionButton type="button" onClick={() => void refetch()} className="border border-red-500/30 bg-slate-800 text-xs text-red-300 hover:bg-slate-700 focus-visible:ring-red-100">
              {isFetching ? "Atualizando..." : "Atualizar"}
            </AdminActionButton>
            <AdminActionButton type="button" onClick={() => router.back()} className="flex items-center gap-2 border border-slate-700 bg-slate-800 text-xs text-white hover:bg-slate-700">
              <ArrowLeft size={16} /> Voltar
            </AdminActionButton>
          </div>
        </div>
      </div>

      <div className="min-h-[500px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isError ? (
          <ErrorState
            title="Falha na comunicação"
            description="Não foi possível carregar a trilha de auditoria do backend."
            size="compact"
            action={
              <AdminActionButton onClick={() => void refetch()}>
                Tentar novamente
              </AdminActionButton>
            }
          />
        ) : loading ? (
          <LoadingState label="Carregando trilha de auditoria..." size="compact" />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<Terminal size={48} className="text-slate-400" />}
            title="Nenhum log registrado"
            description="A trilha de auditoria ainda não retornou eventos para o filtro atual."
            size="compact"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4">Ação / Endpoint</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">IP / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((log, index) => (
                  <tr key={log.id || index} className="transition-colors hover:bg-slate-50">
                    <td className="flex items-center gap-2 px-6 py-4 text-slate-500">
                      <Clock size={12} />
                      {formatDateTime(log.created_at, "Data indisponível")}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {log.action || log.endpoint || "Ação não registrada"}
                    </td>
                    <td className="px-6 py-4 text-blue-600">{log.user || log.user_id || "Sistema"}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2 py-1 font-bold text-slate-600">
                        {log.ip || log.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
