"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapaTaticoClient = dynamic(() => import("./MapaTaticoClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">
      <span className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
      <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Calibrando satélites...</p>
    </div>
  ),
});

export default function MapaPage() {
  return (
    <div className="h-full w-full pb-6">
      <MapaTaticoClient />
    </div>
  );
}
