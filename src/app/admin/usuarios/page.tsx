"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Filter, LifeBuoy, Mail, Pencil, Plus, Search, Shield, ShieldCheck, Trash2, Users } from "lucide-react";

import { AdminHero } from "@/components/ui/AdminHero";
import { AdminActionButton, AdminFieldLabel, AdminFilterSelect, AdminIconButton, AdminSearchInput, AdminStatusBadge } from "@/components/ui/AdminControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageStates";
import { useFeedback } from "@/components/ui/FeedbackProvider";
import { apiFetch } from "@/lib/apiClient";
import { exportableUserRows } from "@/lib/catalog-export";
import { downloadCsv } from "@/lib/csv";
import { extractApiErrorMessage } from "@/lib/errors";
import { normalizeText } from "@/lib/formatters";
import { logClientError } from "@/lib/logger";
import { queryKeys } from "@/lib/queryKeys";
import { useUsersQuery } from "@/lib/queries";
import { managedUserSchema } from "@/lib/schemas";
import { buildPathWithQueryState, hasQueryStateChanged } from "@/lib/url-state";
import type { ApiErrorLike } from "@/lib/types";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
};

function UsuariosPageContent() {
  const { confirm, showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const queryBusca = searchParams.get("busca") || "";
  const queryRole = searchParams.get("role") || "";
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<UserForm>({ name: "", email: "", password: "", role: "" });
  const { data: usuarios = [], isError, isLoading: carregando, refetch } = useUsersQuery();

  function abrirModalNovo() {
    setForm({ name: "", email: "", password: "", role: "" });
    setModalAberto(true);
  }

  async function salvarUsuario() {
    const parsed = managedUserSchema.safeParse(form);
    if (!parsed.success) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: parsed.error.issues[0]?.message || "Preencha todos os campos e selecione o nível de acesso.",
      });
      return;
    }

    setSalvando(true);
    try {
      await apiFetch("/users/admin-create", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setModalAberto(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
      showToast({
        tone: "success",
        title: "Usuário criado",
        description: `${form.name} foi cadastrado com sucesso.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-usuarios:create", error, { email: form.email, role: form.role });
      showToast({
        tone: "error",
        title: "Falha ao criar usuário",
        description: extractApiErrorMessage(error, "Verifique se o e-mail já existe ou se a API está disponível."),
      });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirUsuario(id: string, nome: string) {
    const accepted = await confirm({
      title: `Excluir usuário ${nome}?`,
      description: "Essa conta perderá acesso ao painel imediatamente.",
      confirmLabel: "Excluir usuário",
      tone: "danger",
    });

    if (!accepted) {
      return;
    }

    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
      showToast({
        tone: "success",
        title: "Usuário excluído",
        description: `${nome} foi removido com sucesso.`,
      });
    } catch (rawError) {
      const error = rawError as ApiErrorLike;
      logClientError("admin-usuarios:delete", error, { id });
      showToast({
        tone: "error",
        title: "Falha ao excluir usuário",
        description: extractApiErrorMessage(error, "A API não confirmou a exclusão da conta."),
      });
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = normalizeText(busca);

    return usuarios.filter((usuario) => {
      const matchesBusca =
        !busca ||
        normalizeText(usuario.name).includes(termo) ||
        normalizeText(usuario.email).includes(termo);

      const matchesRole = !filtroRole || usuario.role === filtroRole;
      return matchesBusca && matchesRole;
    });
  }, [busca, filtroRole, usuarios]);

  function exportarUsuarios() {
    downloadCsv(
      "usuarios.csv",
      ["NOME", "EMAIL", "ROLE", "CIDADE", "EMAIL_VERIFICADO", "LAST_PING", "ATIVO"],
      exportableUserRows(usuariosFiltrados),
    );

    showToast({
      tone: "success",
      title: "CSV exportado",
      description: "A lista atual de usuários foi exportada com sucesso.",
    });
  }

  useEffect(() => {
    setBusca(queryBusca);
  }, [queryBusca]);

  useEffect(() => {
    setFiltroRole(queryRole);
  }, [queryRole]);

  useEffect(() => {
    const currentPath = searchParams.toString() ? `/admin/usuarios?${searchParams.toString()}` : "/admin/usuarios";
    const nextPath = buildPathWithQueryState("/admin/usuarios", searchParams.toString(), {
      busca,
      role: filtroRole,
    });
    if (hasQueryStateChanged(currentPath, nextPath)) {
      router.replace(nextPath, { scroll: false });
    }
  }, [busca, filtroRole, router, searchParams]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 animate-in fade-in duration-500">
      <AdminHero
        title="Gestão de Usuários e Acessos"
        description="Controle central de administradores, master e guarda-vidas."
        icon={Users}
        accent="blue"
        loading={carregando}
        actions={
          <AdminActionButton type="button" onClick={abrirModalNovo} className="flex items-center gap-2 bg-blue-600 text-xs text-white hover:bg-blue-500 focus-visible:ring-blue-200">
            <Plus size={16} />
            Novo usuário
          </AdminActionButton>
        }
      />

      <div className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-5 md:flex-row">
          <div className="flex-1">
            <label htmlFor="usuarios-busca" className="sr-only">
              Buscar usuários por nome ou e-mail
            </label>
            <AdminSearchInput
              icon={Search}
              id="usuarios-busca"
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="shrink-0 md:w-64">
            <label htmlFor="usuarios-role" className="sr-only">
              Filtrar usuários por nível de acesso
            </label>
            <AdminFilterSelect
              leadingIcon={Filter}
              id="usuarios-role"
              value={filtroRole}
              onChange={(event) => setFiltroRole(event.target.value)}
              className="cursor-pointer appearance-none py-3.5"
            >
              <option value="">Todos os níveis</option>
              <option value="MASTER">Master</option>
              <option value="ADMIN">Administrador</option>
              <option value="GV">Guarda-vidas</option>
            </AdminFilterSelect>
          </div>
          <div className="shrink-0">
            <AdminActionButton type="button" onClick={exportarUsuarios} className="flex items-center gap-2 border border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-200">
              <Download size={16} />
              Exportar CSV
            </AdminActionButton>
          </div>
        </div>

        <div className="flex-1 bg-slate-50/20 p-6">
          {carregando ? (
            <LoadingState label="Carregando usuários e acessos..." size="compact" className="min-h-[160px]" />
          ) : isError ? (
            <ErrorState
              icon={<Shield size={48} className="text-amber-400" />}
              title="Falha ao carregar usuários"
              description="Não foi possível sincronizar a lista de acessos com o backend."
              size="compact"
              action={
                <AdminActionButton onClick={() => void refetch()}>
                  Tentar novamente
                </AdminActionButton>
              }
              className="min-h-[160px]"
            />
          ) : usuariosFiltrados.length === 0 ? (
            <EmptyState
              icon={<Users size={64} className="text-slate-400" />}
              title="Nenhum usuário encontrado"
              description="Tente ajustar os filtros ou cadastrar um novo acesso."
              className="p-20"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {usuariosFiltrados.map((usuario) => {
                const isMaster = usuario.role === "MASTER";
                const isAdmin = usuario.role === "ADMIN";

                return (
                  <div
                    key={usuario.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div>
                      <div className="mb-5 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black shadow-sm ${
                            isMaster
                              ? "bg-purple-100 text-purple-600"
                              : isAdmin
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {(usuario.name || "U")[0].toUpperCase()}
                        </div>
                        <AdminStatusBadge
                          tone={isMaster ? "danger" : "info"}
                          icon={isMaster ? <ShieldCheck size={12} /> : isAdmin ? <Shield size={12} /> : <LifeBuoy size={12} />}
                        >
                          {usuario.role}
                        </AdminStatusBadge>
                      </div>

                      <h3 className="truncate text-lg font-black tracking-tight text-slate-800" title={usuario.name}>
                        {usuario.name}
                      </h3>
                      <p
                        className="mt-1.5 mb-4 flex truncate items-center gap-1.5 text-xs font-bold text-slate-400"
                        title={usuario.email}
                      >
                        <Mail size={14} />
                        {usuario.email}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                      <Link href={`/admin/editar-usuario/${usuario.id}`} aria-label={`Editar acesso de ${usuario.name}`} className="contents" title="Editar acesso">
                        <AdminIconButton className="hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                          <Pencil size={16} />
                        </AdminIconButton>
                      </Link>
                      <AdminIconButton
                        onClick={() => void excluirUsuario(usuario.id, usuario.name)}
                        aria-label={`Excluir acesso de ${usuario.name}`}
                        className="hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Excluir acesso"
                      >
                        <Trash2 size={16} />
                      </AdminIconButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalAberto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-labelledby="usuarios-modal-title" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 id="usuarios-modal-title" className="flex items-center gap-2 text-xl font-black text-slate-800">
                <ShieldCheck size={24} className="text-blue-600" />
                Cadastrar Novo Acesso
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar modal de cadastro de usuário"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                X
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label htmlFor="usuario-nome" className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Nome completo
                </label>
                <input
                  id="usuario-nome"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex: Joao da Silva"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none transition-colors focus:border-blue-500 focus:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="usuario-email" className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                  E-mail corporativo
                </label>
                <input
                  id="usuario-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Ex: joao@mybeach.com.br"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none transition-colors focus:border-blue-500 focus:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="usuario-password" className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Senha provisória
                  </label>
                  <input
                    id="usuario-password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="********"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none transition-colors focus:border-blue-500 focus:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                  />
                </div>

                <div>
                  <AdminFieldLabel htmlFor="usuario-role" className="text-[11px] text-slate-500">
                    Nível de acesso
                  </AdminFieldLabel>
                  <AdminFilterSelect
                    id="usuario-role"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    className="cursor-pointer bg-slate-50 py-3.5 text-sm text-slate-700 focus:border-blue-500 focus:bg-white"
                  >
                    <option value="" disabled>
                      Selecione um nivel...
                    </option>
                    <option value="GV">Guarda-vidas</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="MASTER">Master</option>
                  </AdminFilterSelect>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-6">
              <AdminActionButton
                type="button"
                tone="light"
                onClick={() => setModalAberto(false)}
                className="flex-1 py-4 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </AdminActionButton>
              <AdminActionButton
                type="button"
                onClick={() => void salvarUsuario()}
                disabled={salvando}
                className="flex flex-[2] items-center justify-center gap-2 bg-blue-600 py-4 text-xs text-white hover:bg-blue-700 focus-visible:ring-blue-200"
              >
                {salvando ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Confirmar cadastro"
                )}
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white" />}>
      <UsuariosPageContent />
    </Suspense>
  );
}
