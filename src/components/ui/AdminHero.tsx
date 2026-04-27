import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AdminHeroProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  accent?: "blue" | "cyan" | "red" | "emerald";
  loading?: boolean;
  actions?: ReactNode;
};

const accentClassMap = {
  blue: "bg-blue-500/10",
  cyan: "bg-cyan-500/10",
  red: "bg-red-500/10",
  emerald: "bg-emerald-500/10",
} as const;

export function AdminHero({
  title,
  description,
  icon: Icon,
  accent = "blue",
  loading = false,
  actions,
}: AdminHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-2xl">
      <div
        className={`absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full blur-[80px] ${accentClassMap[accent]}`}
      />
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex-1">
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
            {Icon ? <Icon size={24} className="text-white" /> : null}
            {title}
            {loading ? <span className="h-2.5 w-2.5 animate-ping rounded-full bg-white/80" /> : null}
          </h1>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
