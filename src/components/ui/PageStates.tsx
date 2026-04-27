import type { ReactNode } from "react";

type LoadingStateProps = {
  label: string;
  className?: string;
  surface?: "light" | "dark";
  size?: "default" | "compact" | "full";
};

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
  surface?: "light" | "dark";
  size?: "default" | "compact" | "full";
};

type ErrorStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
  surface?: "light" | "dark";
  size?: "default" | "compact" | "full";
};

function getSizeClass(size: "default" | "compact" | "full") {
  if (size === "compact") {
    return "p-10";
  }

  if (size === "full") {
    return "min-h-[50vh] p-16";
  }

  return "p-16";
}

export function LoadingState({
  label,
  className = "",
  surface = "light",
  size = "default",
}: LoadingStateProps) {
  const palette =
    surface === "dark"
      ? "text-slate-200"
      : "text-slate-700";
  const spinnerPalette =
    surface === "dark"
      ? "border-slate-700 border-t-cyan-400"
      : "border-slate-200 border-t-slate-700";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${getSizeClass(size)} ${palette} ${className}`.trim()}>
      <span className={`mb-4 h-10 w-10 animate-spin rounded-full border-4 ${spinnerPalette}`} />
      <p className="text-sm font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  className = "",
  action,
  surface = "light",
  size = "default",
}: EmptyStateProps) {
  const textPalette = surface === "dark" ? "text-slate-300" : "text-slate-400";
  const titlePalette = surface === "dark" ? "text-slate-100" : "text-slate-700";
  const descriptionPalette = surface === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${textPalette} ${getSizeClass(size)} ${className}`.trim()}>
      {icon ? <div className="mb-4 opacity-40">{icon}</div> : null}
      <p className={`text-lg font-black ${titlePalette}`}>{title}</p>
      {description ? <p className={`mt-2 max-w-md text-sm ${descriptionPalette}`}>{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  icon,
  title,
  description,
  className = "",
  action,
  surface = "light",
  size = "default",
}: ErrorStateProps) {
  const titlePalette = surface === "dark" ? "text-slate-100" : "text-slate-800";
  const descriptionPalette = surface === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${getSizeClass(size)} ${className}`.trim()}>
      {icon ? <div className="mb-4 opacity-90">{icon}</div> : null}
      <p className={`text-lg font-black ${titlePalette}`}>{title}</p>
      {description ? <p className={`mt-2 max-w-md text-sm ${descriptionPalette}`}>{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
