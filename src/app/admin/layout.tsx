"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart,
  Car,
  ClipboardList,
  LifeBuoy,
  LogOut,
  Map,
  MapPinned,
  Menu,
  ShieldPlus,
  Siren,
  Users,
  Waves,
  X,
} from "lucide-react";

import { clearApiToken } from "@/lib/apiClient";
import { canAccessLogs, canManageUsers, getSessionRole } from "@/lib/auth";

const menuLinks = [
  { href: "/admin", icon: Activity, label: "Dashboard", canAccess: () => true },
  { href: "/admin/ocorrencias", icon: Siren, label: "Ocorrências", canAccess: () => true },
  { href: "/admin/usuarios", icon: Users, label: "Equipe e acessos", canAccess: canManageUsers },
  { href: "/admin/frota", icon: Car, label: "Gestão de frota", canAccess: () => true },
  { href: "/admin/mapa", icon: MapPinned, label: "Mapa tático", canAccess: () => true },
  { href: "/admin/municipios", icon: Map, label: "Municípios", canAccess: () => true },
  { href: "/admin/praias", icon: Waves, label: "Praias", canAccess: () => true },
  { href: "/admin/postos", icon: ShieldPlus, label: "Postos e torres", canAccess: () => true },
  { href: "/admin/relatorios", icon: BarChart, label: "Relatórios", canAccess: () => true },
  { href: "/admin/logs", icon: ClipboardList, label: "Logs e auditoria", canAccess: canAccessLogs },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [role, setRole] = useState<string | null>(() => getSessionRole());
  const visibleLinks = useMemo(() => menuLinks.filter((link) => link.canAccess(role)), [role]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/session", { credentials: "include" });
        if (!response.ok) {
          return;
        }

        const session = (await response.json()) as { authenticated?: boolean; role?: string | null };
        if (active) {
          setRole(session.authenticated ? (session.role || null) : null);
        }
      } catch {
        // Mantem o papel atual do cookie legivel enquanto o endpoint interno nao responde.
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await clearApiToken();
    setRole(null);
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {menuAberto ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0F172A] text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out ${
          menuAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        <div className="mt-4 flex shrink-0 flex-col items-center justify-center border-b border-slate-800/50 p-6 text-center lg:mt-0">
          <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-slate-800 bg-white p-1 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Image src="/logo.png" alt="Logo My Beach" width={96} height={96} className="h-full w-full object-contain" />
          </div>
          <h2 className="text-2xl font-black uppercase leading-none tracking-tight text-white">My Beach</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Admin Console
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden">
          {visibleLinks.map((link) => {
            const isAtivo = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                  isAtivo ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} className={isAtivo ? "text-white" : "text-slate-400"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-slate-800 bg-[#0B1221]">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-3 p-4 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            Encerrar sessão
          </button>

          <div className="flex flex-col items-center justify-center px-4 pt-2 pb-6 text-center">
            <span className="mb-1 text-[9px] font-medium uppercase tracking-widest text-slate-500">
              Desenvolvido por
            </span>
            <div className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 shadow-inner">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-widest text-transparent">
                Rafiels Soluções
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-[#0F172A] px-4 shadow-md lg:hidden">
          <div className="flex items-center gap-2 font-black tracking-tight text-white">
            <LifeBuoy className="text-red-500" size={20} />
            MY BEACH
          </div>
          <button type="button" onClick={() => setMenuAberto(true)} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
