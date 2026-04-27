"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { AdminActionButton, AdminFieldLabel, AdminFilterSelect } from "@/components/ui/AdminControls";
import { EmptyState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { extractApiErrorMessage } from "@/lib/errors";
import { ESTADOS_BR, fetchIbgeCitiesByState, type IbgeCity } from "@/lib/ibge";
import { logClientError } from "@/lib/logger";
import type { ApiErrorLike } from "@/lib/types";

const createCitySchema = z.object({
  state: z.string().length(2, "Selecione um estado válido"),
  name: z.string().min(2, "Selecione uma cidade"),
});

type CreateCityForm = z.infer<typeof createCitySchema>;

export default function NewCityPage() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [ibgeCities, setIbgeCities] = useState<IbgeCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [ibgeError, setIbgeError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CreateCityForm>({
    resolver: zodResolver(createCitySchema),
    defaultValues: { state: "", name: "" },
  });

  useEffect(() => {
    reset({ state: "", name: "" });
  }, [reset]);

  const selectedState = useWatch({ control, name: "state" });

  useEffect(() => {
    async function loadCities() {
      if (!selectedState || selectedState.length !== 2) {
        setIbgeCities([]);
        setIbgeError("");
        return;
      }

      setIsLoadingCities(true);
      setIbgeError("");
      try {
        const cities = await fetchIbgeCitiesByState(selectedState);
        setIbgeCities(cities);
      } catch (error) {
        logClientError("admin-municipios-nova:ibge", error, { state: selectedState });
        setIbgeCities([]);
        setIbgeError("Não foi possível consultar as cidades do estado selecionado.");
        showToast({
          tone: "error",
          title: "Falha ao carregar IBGE",
          description: "Não foi possível consultar as cidades do estado selecionado.",
        });
      } finally {
        setIsLoadingCities(false);
      }
    }

    void loadCities();
  }, [selectedState, showToast]);

  async function onSubmit(data: CreateCityForm) {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        name: data.name,
        state: data.state,
      };

      await apiFetch("/cities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const message = "Cidade cadastrada com sucesso.";
      setSuccessMsg(message);
      showToast({ tone: "success", title: "Cidade criada", description: message });
      reset({ state: "", name: "" });
      setIbgeCities([]);
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-municipios-nova:create", error);
      const message = extractApiErrorMessage(error, "Erro ao criar cidade.");
      setErrorMsg(message);
      showToast({ tone: "error", title: "Falha ao criar cidade", description: message });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Cadastrar nova cidade</h2>
          <AdminActionButton
            type="button"
            tone="light"
            onClick={() => router.push("/admin/municipios")}
            className="text-sm normal-case tracking-normal text-gray-600 hover:text-gray-900"
          >
            Voltar
          </AdminActionButton>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          {successMsg ? (
            <div aria-live="polite" className="mb-6 rounded border border-green-200 bg-green-100 p-3 text-sm font-medium text-green-800">
              {successMsg}
            </div>
          ) : null}

          {errorMsg ? (
            <div aria-live="polite" className="mb-6 rounded border border-red-200 bg-red-100 p-3 text-sm font-medium text-red-700">
              {errorMsg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <AdminFieldLabel htmlFor="nova-cidade-uf" className="mb-1 ml-0 text-sm font-medium normal-case tracking-normal text-gray-700">
                  Estado (UF)
                </AdminFieldLabel>
                <AdminFilterSelect
                  id="nova-cidade-uf"
                  {...register("state")}
                  className="rounded-md border-gray-300 bg-white py-2 text-gray-700 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_BR.map((estado) => (
                    <option key={estado.uf} value={estado.uf}>
                      {estado.uf} - {estado.nome}
                    </option>
                  ))}
                </AdminFilterSelect>
                {errors.state ? <p className="mt-1 text-sm text-red-500">{errors.state.message}</p> : null}
              </div>

              <div className="md:col-span-2">
                <AdminFieldLabel htmlFor="nova-cidade-nome" className="mb-1 ml-0 text-sm font-medium normal-case tracking-normal text-gray-700">
                  Nome da cidade
                </AdminFieldLabel>
                {ibgeError ? (
                  <div className="rounded-md border border-red-200 bg-red-50">
                    <EmptyState
                      className="p-6"
                      title="Falha ao consultar IBGE"
                      description={ibgeError}
                      action={
                        <AdminActionButton
                          type="button"
                          tone="light"
                          onClick={() => reset({ state: selectedState, name: "" })}
                          className="rounded-md bg-white px-4 py-2 text-sm normal-case tracking-normal text-gray-700 hover:bg-gray-50"
                        >
                          Tentar novamente ao trocar a UF
                        </AdminActionButton>
                      }
                    />
                  </div>
                ) : (
                  <AdminFilterSelect
                    id="nova-cidade-nome"
                    {...register("name")}
                    disabled={!selectedState || isLoadingCities}
                    className="rounded-md border-gray-300 bg-white py-2 text-gray-700 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {!selectedState
                        ? "Primeiro selecione o estado..."
                        : isLoadingCities
                          ? "Carregando cidades do IBGE..."
                          : "Selecione a cidade..."}
                    </option>
                    {ibgeCities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </AdminFilterSelect>
                )}
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name.message}</p> : null}
                {!errors.name && selectedState && isLoadingCities ? (
                  <p className="mt-1 text-sm text-gray-500">Atualizando lista oficial de cidades do IBGE.</p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <AdminActionButton
                type="submit"
                disabled={isSubmitting || !selectedState}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm normal-case tracking-normal text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? "Salvando..." : "Salvar cidade"}
              </AdminActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
