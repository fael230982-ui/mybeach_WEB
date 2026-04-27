"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { useFeedback } from "@/components/ui/FeedbackProvider";
import { createSession, hasApiSession } from "@/lib/apiClient";
import { sanitizeAdminRedirectTarget } from "@/lib/auth";
import { logClientError } from "@/lib/logger";

type LoginError = Error & {
  name?: string;
};

function LoginPageContent() {
  const { showToast } = useFeedback();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("/admin");

  useEffect(() => {
    const nextPath = searchParams.get("next");
    setRedirectTarget(sanitizeAdminRedirectTarget(nextPath));
  }, [searchParams]);

  useEffect(() => {
    if (hasApiSession()) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await createSession(email, password);

      showToast({
        tone: "success",
        title: "Login realizado",
        description: "Sessão autenticada com sucesso.",
      });
      router.push(redirectTarget);
    } catch (rawError) {
      const err = rawError as LoginError & { status?: number };
      if (err.status === 401 || err.status === 404) {
        const authMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
        setErro(authMessage);
        showToast({ tone: "error", title: "Falha no login", description: authMessage });
        setLoading(false);
        return;
      }

      const message =
        err.message === "Failed to fetch" || err.name === "TypeError"
          ? "O servidor não respondeu. Verifique a configuração da API e a conectividade do backend."
          : err.message || "Erro interno de autenticação.";

      logClientError("login:request", err);
      setErro(message);
      showToast({ tone: "error", title: "Falha no login", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-900/40 backdrop-blur-[2px]" />

      <div className="relative z-20 flex w-full max-w-[1200px] flex-col items-center justify-between p-6 md:flex-row md:p-12">
        <div className="mb-12 hidden max-w-lg flex-col text-white animate-in fade-in slide-in-from-left-8 duration-1000 md:flex">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={48}
              className="h-12 w-auto brightness-0 invert"
              priority
            />
            <h2 className="text-3xl font-black leading-none tracking-tight">
              MY<span className="text-blue-500">BEACH</span>
            </h2>
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight drop-shadow-lg">
            Acompanhe.
            <br />
            Monitore.
            <br />
            <span className="text-blue-500">Salve vidas.</span>
          </h1>
          <p className="rounded-r-xl border-l-4 border-blue-500 bg-slate-900/30 p-3 pl-4 text-lg text-slate-300 shadow-xl backdrop-blur-sm">
            Centro de operações táticas. Acesso restrito a pessoal autorizado e oficiais de comando.
          </p>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black tracking-tight text-white">Identificação</h2>
              <p className="mt-1 text-sm font-medium text-blue-200">Insira suas credenciais da MyBeach</p>
            </div>

            {erro ? (
              <div aria-live="polite" className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-xs font-bold text-red-200 animate-in">
                <span className="text-lg">!</span>
                <span>{erro}</span>
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  E-mail operacional
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="comandante@mybeach.com.br"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 py-3.5 pr-4 pl-12 text-sm text-white shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="absolute top-3.5 left-4 text-slate-400">@</span>
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  Senha de acesso
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 py-3.5 pr-4 pl-12 text-sm text-white shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="absolute top-3.5 left-4 text-slate-400">*</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] disabled:bg-blue-600/50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Autenticando...
                  </>
                ) : (
                  "Iniciar sessão"
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Protegido por criptografia de ponta a ponta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginPageContent />
    </Suspense>
  );
}
