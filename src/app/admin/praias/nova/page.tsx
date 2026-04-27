"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Save, X } from "lucide-react";

import { AdminActionButton, AdminFieldLabel, AdminFilterSelect } from "@/components/ui/AdminControls";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { extractApiErrorMessage } from "@/lib/errors";
import { logClientError } from "@/lib/logger";
import { useCitiesQuery } from "@/lib/queries";
import { beachFormSchema } from "@/lib/schemas";
import { getCityMapCenter } from "@/lib/territory-data";
import type { ApiErrorLike, AppCity, LatLngTuple } from "@/lib/types";

const MapaPraiaDinamico = dynamic(() => import("@/components/ZonePolygonDrawer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50">
      <span className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Conectando ao satélite...
      </p>
    </div>
  ),
});

export default function NovaPraiaPage() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [cityId, setCityId] = useState("");
  const [area, setArea] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
  const { data: cidades = [] } = useCitiesQuery();
  const cidadesOrdenadas = useMemo(
    () => [...(cidades as AppCity[])].sort((a, b) => a.name.localeCompare(b.name)),
    [cidades],
  );

  function handleCityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const idSelecionado = event.target.value;
    setCityId(idSelecionado);

    const cidadeObj = cidadesOrdenadas.find((cidade) => String(cidade.id) === idSelecionado);
    setMapCenter(getCityMapCenter(cidadeObj));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = beachFormSchema.safeParse({
      name,
      city_id: cityId,
      area,
      is_active: isActive,
    });

    if (!parsed.success) {
      showToast({
        tone: "error",
        title: "Dados inválidos",
        description: parsed.error.issues[0]?.message || "Revise os campos obrigatórios da praia.",
      });
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/beaches", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });

      showToast({ tone: "success", title: "Praia criada", description: `${name} foi cadastrada com sucesso.` });
      router.push("/admin/praias");
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      const message = extractApiErrorMessage(error, "Falha de permissão ou conexão.");
      showToast({ tone: "error", title: "Falha ao salvar praia", description: message });
      logClientError("admin-praias-nova:create", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-slate-900 p-8 shadow-xl md:flex-row md:items-center">
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="flex items-center gap-4 text-3xl font-black tracking-tight text-white">
              <MapPin size={32} className="text-blue-500" />
              Mapear nova praia
            </h1>
            <p className="mt-2 font-medium text-slate-400">
              Selecione a cidade e desenhe o perímetro oficial de atuação.
            </p>
          </div>
          <AdminActionButton
            type="button"
            onClick={() => router.back()}
            aria-label="Voltar para a tela anterior"
            className="rounded-full bg-slate-800 p-3 text-slate-400 hover:text-white focus-visible:ring-blue-200"
          >
            <X size={24} />
          </AdminActionButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <AdminFieldLabel htmlFor="nova-praia-nome" className="mb-0 ml-0 text-xs text-slate-500">Nome da base/praia</AdminFieldLabel>
            <input
              id="nova-praia-nome"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Praia das Pitangueiras"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <AdminFieldLabel htmlFor="nova-praia-cidade" className="mb-0 ml-0 text-xs text-slate-500">Cidade</AdminFieldLabel>
            <AdminFilterSelect
              id="nova-praia-cidade"
              value={cityId}
              onChange={handleCityChange}
              className="cursor-pointer appearance-none bg-slate-50 py-3 text-sm text-slate-800 focus:border-blue-500"
            >
              <option value="">Selecione uma cidade...</option>
              {cidadesOrdenadas.map((cidade) => (
                <option key={cidade.id} value={String(cidade.id)}>
                  {cidade.name}
                </option>
              ))}
            </AdminFilterSelect>
          </div>
        </div>

        <div className="mb-8">
          <MapaPraiaDinamico onPolygonChange={setArea} centerCoords={mapCenter} initialPolygon={area} />

          {area ? (
            <div aria-live="polite" className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-[10px] font-mono text-emerald-700">
              <CheckCircle2 size={14} /> Polígono capturado e pronto para envio.
            </div>
          ) : null}
        </div>

        <AdminActionButton
          type="button"
          aria-pressed={isActive}
          onClick={() => setIsActive(!isActive)}
          tone="light"
          className="mb-8 flex w-full items-center gap-3 border-slate-200 bg-slate-50 p-4 text-left normal-case tracking-normal hover:bg-slate-100 focus-visible:ring-blue-100"
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
              isActive ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
            }`}
          >
            {isActive ? <CheckCircle2 size={16} color="#fff" /> : null}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Ativar imediatamente</p>
            <p className="text-xs font-medium text-slate-500">
              A praia ficará visível no app cidadão assim que salvar.
            </p>
          </div>
        </AdminActionButton>

        <AdminActionButton
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 py-4 text-xs shadow-lg focus-visible:ring-blue-100 ${
            loading
              ? "cursor-not-allowed bg-blue-400 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30"
          }`}
        >
          {loading ? "Transmitindo..." : <><Save size={16} /> Gravar cerca no sistema</>}
        </AdminActionButton>
      </form>
    </div>
  );
}
