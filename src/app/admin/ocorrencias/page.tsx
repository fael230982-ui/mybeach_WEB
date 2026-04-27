"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  BatteryWarning,
  CheckCircle,
  Clock,
  Crosshair,
  MapPin,
  Navigation,
  ShieldAlert,
  User,
} from "lucide-react";

import { AdminActionButton } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import {
  formatBatteryLevel,
  getAlertPriorityWeight,
  isActiveAlert,
  isFalseAlarmAlert,
  isLowBatteryLevel,
  isPendingAlert,
} from "@/lib/alerts";
import { formatDateTime } from "@/lib/formatters";
import { useAlertsQuery } from "@/lib/queries";
import type { AppAlert } from "@/lib/types";

type StatusVisual = {
  texto: string;
  corBase: string;
  corBorda: string;
  corTexto: string;
  bgHeader: string;
  icone: React.ReactNode;
};

function getStatusVisual(statusCrude: string): StatusVisual {
  if (isPendingAlert(statusCrude)) {
    return {
      texto: "Aguardando despacho",
      corBase: "bg-red-500/10",
      corBorda: "border-red-500/50",
      corTexto: "text-red-500",
      bgHeader: "bg-red-600",
      icone: <AlertTriangle size={18} className="animate-pulse" />,
    };
  }
  if (isActiveAlert(statusCrude) && !isPendingAlert(statusCrude)) {
    return {
      texto: "Guarnição a caminho",
      corBase: "bg-blue-500/10",
      corBorda: "border-blue-500/50",
      corTexto: "text-blue-500",
      bgHeader: "bg-blue-600",
      icone: <Crosshair size={18} />,
    };
  }
  if (isFalseAlarmAlert(statusCrude)) {
    return {
      texto: "Alarme Falso",
      corBase: "bg-slate-800/50",
      corBorda: "border-slate-700",
      corTexto: "text-slate-400",
      bgHeader: "bg-slate-700",
      icone: <AlertCircle size={18} />,
    };
  }
  return {
    texto: "Resolvido",
    corBase: "bg-slate-800/50",
    corBorda: "border-slate-700",
    corTexto: "text-emerald-500",
    bgHeader: "bg-emerald-600",
    icone: <CheckCircle size={18} />,
  };
}

function getBeachName(alerta: AppAlert) {
  return alerta.beach_name || alerta.location_name || "Coordenada Externa (GPS)";
}

export default function OcorrenciasPage() {
  const router = useRouter();
  const { data = [], isError, isLoading: carregando, refetch, dataUpdatedAt, isFetching } = useAlertsQuery({ refetchInterval: 10_000 });
  const alertas = useMemo(
    () =>
      [...data].sort((a: AppAlert, b: AppAlert) => {
        const pesoA = getAlertPriorityWeight(a.status);
        const pesoB = getAlertPriorityWeight(b.status);
        if (pesoA !== pesoB) {
          return pesoA - pesoB;
        }

        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }),
    [data],
  );

  if (carregando) {
    return <LoadingState label="Carregando histórico operacional..." surface="dark" size="full" className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl min-h-[600px]" />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <ErrorState
            surface="dark"
            size="full"
            title="Falha ao carregar ocorrências"
            description="O backend não retornou a fila operacional. Recarregue para tentar sincronizar novamente."
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl border border-cyan-500 bg-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-cyan-400"
              >
                Recarregar ocorrências
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] animate-in fade-in duration-500 pb-10 p-6">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:flex-row sm:items-center sm:p-6">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/20 p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <ShieldAlert size={32} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Ficha de ocorrências
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Relatório completo e acesso rápido ao monitoramento geolocalizado
          </p>
          {dataUpdatedAt ? (
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Última sincronização: {formatDateTime(new Date(dataUpdatedAt).toISOString(), "--")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl border border-cyan-500/30 bg-slate-800 px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-400 transition-colors hover:bg-slate-700 sm:ml-auto"
        >
          {isFetching ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {alertas.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={48} className="text-slate-400" />}
          title="Nenhuma ocorrência retornada"
          description="A API ainda não reportou alertas operacionais para este painel."
          surface="dark"
          size="compact"
        />
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {alertas.map((alerta) => {
          const visual = getStatusVisual(alerta.status);
          const isAtiva = isActiveAlert(alerta.status);

          return (
            <div
              key={alerta.id}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-slate-900 shadow-xl transition-all hover:scale-[1.02] ${visual.corBorda} ${!isAtiva ? "opacity-80 hover:opacity-100" : ""}`}
            >
              <div className={`${visual.bgHeader} flex items-center justify-between px-5 py-3 text-white shadow-md`}>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                  {visual.icone} {visual.texto}
                </div>
                <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold">
                  <Clock size={12} /> {formatDateTime(alerta.created_at, "").split(", ")[1] || "--:--"}
                </div>
              </div>

              <div className={`flex flex-1 flex-col gap-4 p-5 ${visual.corBase}`}>
                <div className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-950/50 p-3">
                  <div className="shrink-0 rounded-lg bg-slate-800 p-2">
                    <MapPin size={20} className="text-cyan-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Localização do sinal
                    </p>
                    <p className="truncate text-sm font-bold text-white" title={getBeachName(alerta)}>
                      {getBeachName(alerta)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/50 p-2.5">
                    <User size={16} className="shrink-0 text-slate-400" />
                    <div className="overflow-hidden">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                        Solicitante
                      </p>
                      <p className="truncate text-xs font-semibold text-slate-200">
                        {alerta.user_name || "Anônimo"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/50 p-2.5">
                    <BatteryWarning
                      size={16}
                      className={
                        isLowBatteryLevel(alerta.battery_level)
                          ? "shrink-0 animate-pulse text-red-500"
                          : "shrink-0 text-amber-400"
                      }
                    />
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                        Bateria
                      </p>
                      <p className="text-xs font-semibold text-slate-200">
                        {formatBatteryLevel(alerta.battery_level)}
                      </p>
                    </div>
                  </div>
                </div>

                {alerta.procedimento || alerta.observacoes_finais ? (
                  <div className="mt-auto space-y-2 border-t border-slate-700/50 pt-3">
                    {alerta.procedimento ? (
                      <div>
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Viatura atribuída
                        </p>
                        <p className="text-[11px] font-black uppercase text-cyan-400">
                          {alerta.procedimento}
                        </p>
                      </div>
                    ) : null}
                    {alerta.observacoes_finais ? (
                      <div>
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Relatório do operador
                        </p>
                        <p className="line-clamp-2 text-[11px] italic leading-snug text-slate-300">
                          &quot;{alerta.observacoes_finais}&quot;
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-slate-800 bg-slate-900 p-3">
                <AdminActionButton
                  type="button"
                  onClick={() => router.push(`/admin/mapa?focus=${alerta.id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:border-cyan-500 hover:bg-cyan-600"
                >
                  <Navigation size={14} /> Ver posição no radar
                </AdminActionButton>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
