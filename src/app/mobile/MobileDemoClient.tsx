"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { useFeedback } from "@/components/ui/FeedbackProvider";

type MobileBeach = {
  id: string;
  nome: string;
  cidade: string;
  distancia: string;
  imagemAerea: string;
  bandeira: "verde" | "amarela" | "vermelha";
  statusBandeira: string;
  mensagem: string;
  riscosMapeados: string;
  clima: string;
  agua: string;
  uv: string;
  mare: string;
};

const beachesData: Record<string, MobileBeach> = {
  praia_central: {
    id: "praia_central",
    nome: "Praia Central",
    cidade: "Balneario Camboriu",
    distancia: "0.2 km",
    imagemAerea:
      "https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=1000&auto=format&fit=crop",
    bandeira: "verde",
    statusBandeira: "Mar seguro",
    mensagem: "Agua limpa e sem correntes fortes aparentes.",
    riscosMapeados: "Nenhuma corrente detectada no radar.",
    clima: "28 C",
    agua: "24 C",
    uv: "8",
    mare: "14h30",
  },
  praia_brava: {
    id: "praia_brava",
    nome: "Praia Brava",
    cidade: "Itajai, SC",
    distancia: "4.5 km",
    imagemAerea:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1000&auto=format&fit=crop",
    bandeira: "vermelha",
    statusBandeira: "Alto risco",
    mensagem: "Mar agitado. Agua ate a cintura no maximo.",
    riscosMapeados: "2 correntes ativas nos postos 2 e 4.",
    clima: "27 C",
    agua: "22 C",
    uv: "10",
    mare: "18h00",
  },
  itamambuca: {
    id: "itamambuca",
    nome: "Itamambuca",
    cidade: "Ubatuba, SP",
    distancia: "540 km",
    imagemAerea:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000&auto=format&fit=crop",
    bandeira: "amarela",
    statusBandeira: "Atencao",
    mensagem: "Condicoes moderadas. Fique atento.",
    riscosMapeados: "Relatos recentes de aguas-vivas.",
    clima: "26 C",
    agua: "23 C",
    uv: "7",
    mare: "Agora",
  },
};

const statusClasses: Record<MobileBeach["bandeira"], string> = {
  verde: "bg-emerald-500 text-white",
  amarela: "bg-amber-400 text-amber-950",
  vermelha: "bg-red-600 text-white",
};

const dotClasses: Record<MobileBeach["bandeira"], string> = {
  verde: "bg-emerald-500",
  amarela: "bg-amber-500",
  vermelha: "bg-red-500",
};

export default function MobileDemoClient() {
  const { showToast } = useFeedback();
  const [loadingGps, setLoadingGps] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "search" | "kids">("home");
  const [selectedBeach, setSelectedBeach] = useState<keyof typeof beachesData>("praia_central");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoadingGps(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const current = beachesData[selectedBeach];
  const allBeaches = Object.values(beachesData);

  const filteredBeaches = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return allBeaches.filter(
      (beach) =>
        beach.nome.toLowerCase().includes(normalizedQuery) ||
        beach.cidade.toLowerCase().includes(normalizedQuery),
    );
  }, [allBeaches, searchQuery]);

  function handleSelectBeachFromSearch(id: keyof typeof beachesData) {
    setSelectedBeach(id);
    setSearchQuery("");
    setActiveTab("home");
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#eef2f7] px-4 py-6 selection:bg-cyan-100">
      <div className="relative flex min-h-screen w-full max-w-[420px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-[#fafbfc] shadow-2xl">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 pb-3 pt-10 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Icone My Beach" width={32} height={32} className="h-8 w-8 object-contain" />
            <Image src="/name.png" alt="Nome My Beach" width={100} height={30} className="h-4 w-auto object-contain" />
          </div>
          <button
            type="button"
            aria-label="Perfil"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:text-cyan-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
        </header>

        {loadingGps ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 text-center">
            <div className="relative mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-100" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Obtendo GPS...</h2>
            <p className="mt-2 text-sm text-slate-500">Sincronizando a praia mais proxima.</p>
          </div>
        ) : (
          <>
            {activeTab === "home" ? (
              <div className="flex-1 overflow-y-auto pb-24">
                <div className="relative h-[240px] w-full overflow-hidden bg-slate-950">
                  <Image src={current.imagemAerea} alt={current.nome} fill sizes="420px" className="object-cover opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {current.distancia} de voce
                  </div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md ${statusClasses[current.bandeira]}`}>
                        {current.statusBandeira}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black leading-none tracking-tight text-white drop-shadow-lg">{current.nome}</h2>
                    <p className="mt-1 text-sm font-medium text-white/80 drop-shadow-md">{current.cidade}</p>
                  </div>
                </div>

                <div className="-mt-3 space-y-5 px-5 py-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status operacional</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">{current.statusBandeira}</h3>
                    <p className="mt-1 text-sm text-slate-600">{current.mensagem}</p>
                  </div>

                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Radar de perigos</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">{current.riscosMapeados}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("kids")}
                    className="flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-16 items-center justify-center rounded bg-white p-1 shadow-sm">
                        <Image src="/kids-logo.png" alt="My Beach Kids" width={100} height={40} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">Rastreamento</p>
                        <p className="text-xs font-bold text-indigo-600">Proteja seus filhos</p>
                      </div>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm" aria-hidden="true">
                      &gt;
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Clima", val: current.clima, icon: "Sol" },
                      { label: "Agua", val: current.agua, icon: "Mar" },
                      { label: "Raios UV", val: current.uv, icon: "UV" },
                      { label: "Mare", val: current.mare, icon: "Lua" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm font-black text-slate-900">{item.val}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">{item.icon}</p>
                      </div>
                    ))}
                  </div>

                  <div className="relative flex flex-col items-center justify-center py-4">
                    <div className="absolute h-24 w-24 animate-ping rounded-full bg-red-500 opacity-20" />
                    <button
                      type="button"
                      onClick={() =>
                        showToast({
                          tone: "success",
                          title: "SOS enviado",
                          description: "A central recebeu sua localizacao e iniciou o atendimento.",
                        })
                      }
                      className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-b from-red-500 to-red-700 shadow-[0_8px_20px_rgba(220,38,38,0.4)] transition-transform active:scale-90"
                    >
                      <span className="text-[11px] font-black tracking-widest text-white">SOS</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "search" ? (
              <div className="flex-1 overflow-y-auto bg-white px-5 pb-24 pt-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Explorar</h2>
                <p className="mb-6 mt-1 text-sm font-medium text-slate-500">
                  Consulte a situacao do mar em outras regioes.
                </p>
                <div className="relative mb-6">
                  <label htmlFor="mobile-beach-search" className="sr-only">
                    Buscar praia
                  </label>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    Buscar
                  </span>
                  <input
                    id="mobile-beach-search"
                    type="text"
                    placeholder="Nome da praia..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-16 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                </div>
                <div className="space-y-3">
                  {filteredBeaches.map((beach) => (
                    <button
                      type="button"
                      key={beach.id}
                      onClick={() => handleSelectBeachFromSearch(beach.id as keyof typeof beachesData)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-all hover:border-cyan-300"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                        <Image src={beach.imagemAerea} alt={beach.nome} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900">{beach.nome}</h3>
                        <p className="text-[11px] font-medium text-slate-500">{beach.cidade}</p>
                      </div>
                      <div className={`mr-2 h-2.5 w-2.5 rounded-full ${dotClasses[beach.bandeira]}`} />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "kids" ? (
              <div className="flex flex-1 flex-col items-center overflow-y-auto bg-white px-6 pb-24 pt-10 text-center">
                <div className="mb-6 flex h-20 w-40 items-center justify-center">
                  <Image src="/kids-logo.png" alt="My Beach Kids" width={150} height={60} className="h-full w-full object-contain drop-shadow-md" />
                </div>
                <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-900">Rastreamento ativo</h2>
                <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
                  Acompanhe a localizacao do seu filho em tempo real. Solicite uma pulseira em qualquer posto.
                </p>
                <div className="mb-8 w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                    Kids
                  </div>
                  <p className="text-sm font-bold text-slate-600">Nenhuma pulseira vinculada</p>
                </div>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-600/30 transition-transform hover:bg-indigo-700 active:scale-95">
                  Vincular nova pulseira
                </button>
              </div>
            ) : null}
          </>
        )}

        <div className="absolute bottom-0 z-40 flex w-full items-center justify-around border-t border-slate-200/60 bg-white/90 px-6 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "home" ? "text-cyan-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span>Inicio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "search" ? "text-cyan-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span>Busca</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kids")}
            className={`relative flex flex-col items-center gap-1 transition-colors ${activeTab === "kids" ? "text-indigo-600" : "text-slate-400 hover:text-indigo-500"}`}
          >
            <span>Kids</span>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
