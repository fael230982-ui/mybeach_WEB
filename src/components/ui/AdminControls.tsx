import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AdminActionButtonProps = ComponentPropsWithoutRef<"button"> & {
  tone?: "dark" | "light";
  size?: "default" | "compact";
};

type AdminSearchInputProps = ComponentPropsWithoutRef<"input"> & {
  icon?: LucideIcon;
};

type AdminFilterSelectProps = ComponentPropsWithoutRef<"select"> & {
  leadingIcon?: LucideIcon;
  className?: string;
};

type AdminChipButtonProps = ComponentPropsWithoutRef<"button"> & {
  active?: boolean;
};

type AdminStatusBadgeProps = {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  size?: "default" | "compact";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AdminActionButton({
  tone = "dark",
  size = "default",
  className,
  type = "button",
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        "rounded-xl font-black uppercase tracking-widest transition-colors focus-visible:outline-none",
        "focus-visible:ring-4",
        size === "compact" ? "px-4 py-3 text-xs" : "px-5 py-3 text-sm",
        tone === "dark"
          ? "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-200"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200",
        className,
      )}
      {...props}
    />
  );
}

export function AdminSearchInput({
  icon: Icon,
  className,
  ...props
}: AdminSearchInputProps) {
  return (
    <div className="relative w-full">
      {Icon ? (
        <span className="absolute left-4 top-3.5 text-slate-400">
          <Icon size={18} />
        </span>
      ) : null}
      <input
        className={joinClassNames(
          "w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 text-sm font-bold outline-none transition-all",
          "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          Icon ? "pl-11" : "pl-4",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function AdminFilterSelect({
  leadingIcon: Icon,
  className,
  children,
  ...props
}: AdminFilterSelectProps) {
  return (
    <div className="relative w-full">
      {Icon ? (
        <span className="absolute left-3 top-3.5 text-slate-400">
          <Icon size={16} />
        </span>
      ) : null}
      <select
        className={joinClassNames(
          "w-full rounded-xl border border-slate-200 bg-white py-3 pr-8 text-sm font-bold text-slate-600 outline-none",
          "focus:border-blue-500",
          Icon ? "pl-10" : "pl-4",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function InlineMetric({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClassNames("flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4", className)}>
      <div className="flex items-center gap-3">
        {icon ? <div className="rounded-lg bg-slate-800 p-2 text-white">{icon}</div> : null}
        <p className="text-xs font-bold uppercase tracking-widest text-white">{label}</p>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export function AdminChipButton({
  active = false,
  className,
  type = "button",
  ...props
}: AdminChipButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        "shrink-0 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200",
        active
          ? "bg-slate-900 text-white shadow-md"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}

export function AdminSegmentedTabs({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={joinClassNames("flex rounded-2xl border border-slate-700 bg-slate-800 p-1.5", className)}>
      {children}
    </div>
  );
}

export function AdminTabButton({
  active = false,
  className,
  type = "button",
  ...props
}: AdminChipButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200",
        active ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function AdminKpiCard({
  label,
  value,
  accent = "slate",
  icon,
  footer,
  dark = false,
  className,
}: {
  label: string;
  value: ReactNode;
  accent?: "slate" | "emerald" | "indigo";
  icon?: ReactNode;
  footer?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const accentLabelClass =
    accent === "emerald" ? "text-emerald-400" : accent === "indigo" ? "text-indigo-400" : "text-slate-400";

  return (
    <div
      className={joinClassNames(
        "group relative overflow-hidden rounded-3xl border p-6 shadow-sm",
        dark ? "border-slate-800 bg-slate-900 shadow-xl" : "border-slate-200 bg-white",
        className,
      )}
    >
      {icon ? (
        <div className={joinClassNames("absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110", dark ? "text-emerald-500 opacity-10" : "")}>
          {icon}
        </div>
      ) : null}
      <p className={joinClassNames("text-[10px] font-black uppercase tracking-widest", accentLabelClass)}>{label}</p>
      <p className={joinClassNames("mt-2 text-5xl font-black", dark ? "text-white" : "text-slate-800")}>{value}</p>
      {footer ? <div className="mt-4 flex w-fit items-center gap-2 rounded px-2 py-1 text-xs font-bold">{footer}</div> : null}
    </div>
  );
}

export function AdminStatusBadge({
  tone = "neutral",
  size = "default",
  icon,
  children,
  className,
}: AdminStatusBadgeProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-600"
        : tone === "danger"
          ? "border-red-200 bg-red-50 text-red-600"
          : tone === "info"
            ? "border-cyan-100 bg-cyan-50 text-cyan-600"
            : "border-slate-200 bg-slate-100 text-slate-500";

  return (
    <span
      className={joinClassNames(
        "inline-flex items-center rounded border font-black uppercase tracking-widest",
        size === "compact" ? "gap-1 px-2 py-1 text-[9px]" : "gap-1.5 px-2.5 py-1 text-[10px]",
        toneClass,
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function AdminIconButton({
  className,
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type={type}
      className={joinClassNames(
        "rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition-all",
        "hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200",
        className,
      )}
      {...props}
    />
  );
}

export function AdminFieldLabel({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={joinClassNames(
        "mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
