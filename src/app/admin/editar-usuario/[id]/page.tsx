"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { AdminActionButton, AdminFieldLabel, AdminFilterSelect } from "@/components/ui/AdminControls";
import { EmptyState, LoadingState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { extractApiErrorMessage } from "@/lib/errors";
import { logClientError } from "@/lib/logger";
import { useCitiesQuery, useUsersQuery } from "@/lib/queries";
import type { ApiErrorLike, AppCity, AppUser } from "@/lib/types";

const editUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  password: z.string().optional(),
  city_id: z.string().min(1, "A seleção da cidade é obrigatória"),
});

type EditUserForm = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
  });

  const { data: citiesData = [], isError: isCitiesError, isLoading: isCitiesLoading, refetch: refetchCities } = useCitiesQuery();
  const { data: allUsersData = [], isError: isUsersError, isLoading: isUserLoading, refetch: refetchUsers } = useUsersQuery();

  const citiesList: AppCity[] = Array.isArray(citiesData) ? (citiesData as AppCity[]) : [];
  const usersList: AppUser[] = Array.isArray(allUsersData) ? (allUsersData as AppUser[]) : [];
  const user = usersList.find((candidate) => String(candidate.id) === String(userId));

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      name: user.name,
      email: user.email,
      city_id: String(user.city_id || ""),
      password: "",
    });
  }, [reset, user]);

  async function onSubmit(data: EditUserForm) {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiFetch(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          city_id: data.city_id,
          ...(data.password?.trim() ? { password: data.password.trim() } : {}),
        }),
      });

      const message = "Usuário atualizado com sucesso.";
      setSuccessMsg(message);
      showToast({ tone: "success", title: "Usuário atualizado", description: message });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-editar-usuario:update", error, { userId });
      const message = extractApiErrorMessage(error, "Erro ao atualizar usuário.");
      setErrorMsg(message);
      showToast({ tone: "error", title: "Falha ao atualizar usuário", description: message });
    }
  }

  if (isUserLoading) {
    return <LoadingState label="Buscando dados do usuário..." size="full" className="min-h-[60vh]" />;
  }

  if (isUsersError || isCitiesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <EmptyState
              title="Falha ao carregar dados do usuário"
              description="Não foi possível sincronizar usuários ou cidades para a edição."
              size="compact"
              action={
                <AdminActionButton type="button" onClick={() => {
                    void refetchUsers();
                    void refetchCities();
                  }} className="rounded-md bg-blue-600 px-4 py-2 text-sm normal-case tracking-normal text-white hover:bg-blue-700">
                  Tentar novamente
                </AdminActionButton>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isUserLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <EmptyState
              title="Usuário não encontrado"
              description="Ele pode ter sido removido ou o identificador não existe mais."
              size="compact"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            Editando <span className="text-blue-700">{user?.name}</span>
          </h2>
          <AdminActionButton type="button" tone="light" onClick={() => router.push("/admin/usuarios")} className="rounded-md border-gray-300 bg-gray-50 px-3 py-1 text-sm normal-case tracking-normal text-gray-600 focus-visible:ring-blue-100">
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
            <div>
              <label htmlFor="editar-usuario-nome" className="mb-1 block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="editar-usuario-nome"
                type="text"
                {...register("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              />
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name.message}</p> : null}
            </div>

            <div>
              <label htmlFor="editar-usuario-email" className="mb-1 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="editar-usuario-email"
                type="email"
                {...register("email")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              />
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="editar-usuario-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  id="editar-usuario-password"
                  type="password"
                  {...register("password")}
                  placeholder="Deixe em branco para manter a atual"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                />
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                ) : null}
              </div>

              <div>
                <AdminFieldLabel htmlFor="editar-usuario-cidade" className="mb-1 ml-0 text-sm font-medium normal-case tracking-normal text-gray-700">Cidade</AdminFieldLabel>
                <AdminFilterSelect
                  id="editar-usuario-cidade"
                  {...register("city_id")}
                  className="rounded-md border-gray-300 bg-white py-2 text-gray-700 focus:border-blue-500 disabled:bg-gray-100"
                  disabled={isCitiesLoading}
                >
                  <option value="">Selecione uma cidade...</option>
                  {citiesList.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                      {city.state ? ` - ${city.state}` : ""}
                    </option>
                  ))}
                </AdminFilterSelect>
                {errors.city_id ? (
                  <p className="mt-1 text-sm text-red-500">{errors.city_id.message}</p>
                ) : null}
                {!errors.city_id && isCitiesLoading ? (
                  <p className="mt-1 text-sm text-gray-500">Atualizando cidades disponíveis.</p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <AdminActionButton type="button" tone="light" onClick={() => router.push("/admin/usuarios")} className="rounded-md border-gray-300 bg-white px-4 py-2 text-sm normal-case tracking-normal text-gray-700 focus-visible:ring-blue-100">
                Cancelar
              </AdminActionButton>
              <AdminActionButton type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm normal-case tracking-normal text-white hover:bg-blue-700 disabled:bg-blue-300 focus-visible:ring-blue-100">
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </AdminActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
