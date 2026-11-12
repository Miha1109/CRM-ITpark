import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Server, LayoutGrid, ClipboardList, Printer, Network, HardDrive, Users, Mail, Shield, ShieldCheck,
  ArrowLeftRight, Radar, Package, CircleCheck, Plug, BarChart3, UserCog, ScrollText, Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Item = { label: string; icon: typeof Server; to?: "/" | "/assets" | "/integrations" };
const NAV: { title: string; items: Item[] }[] = [
  { title: "Оборудование", items: [
    { label: "Дашборд", icon: LayoutGrid, to: "/" },
    { label: "Оборудование (реестр)", icon: ClipboardList, to: "/assets" },
    { label: "Принтеры и МФУ", icon: Printer }, { label: "Сетевое оборудование", icon: Network },
    { label: "СХД", icon: HardDrive }, { label: "МОЛ и сотрудники", icon: Users }] },
  { title: "Учётные записи и ИБ", items: [
    { label: "Почты", icon: Mail }, { label: "ИБ (учётки)", icon: Shield }, { label: "Антивирус (KSC)", icon: ShieldCheck }] },
  { title: "Обслуживание", items: [
    { label: "Инвентаризация TNI", icon: ArrowLeftRight }, { label: "Сканирование сети", icon: Radar },
    { label: "Инсталляционные пакеты", icon: Package }, { label: "Задачи", icon: CircleCheck }] },
  { title: "Система", items: [{ label: "Интеграции", icon: Plug, to: "/integrations" }, { label: "Отчёты", icon: BarChart3 }] },
  { title: "Администрирование", items: [{ label: "Пользователи и права", icon: UserCog }, { label: "Журнал и аудит", icon: ScrollText }] },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);
  const active = (to?: string) => to && (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <div className="flex min-h-screen w-full">
      <aside className={cn("sticky top-0 h-screen shrink-0 overflow-y-auto bg-sidebar text-sidebar-foreground transition-all", open ? "w-64" : "w-16")}>
        <div className="flex h-16 items-center gap-2 px-4 font-semibold">
          <Server className="h-5 w-5 shrink-0 text-sidebar-primary" />
          {open && <span className="text-base">CRM IT-парк</span>}
        </div>
        {NAV.map((g) => (
          <div key={g.title} className="px-3 pb-2">
            {open && <div className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{g.title}</div>}
            {g.items.map((it) => {
              const cls = cn("flex items-center gap-3 rounded-md px-2 py-2 text-sm",
                active(it.to) ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60",
                !it.to && "cursor-default opacity-60 hover:bg-transparent");
              const inner = (<><it.icon className="h-4 w-4 shrink-0" />{open && <span className="truncate">{it.label}</span>}</>);
              return it.to ? <Link key={it.label} to={it.to} className={cls} title={it.label}>{inner}</Link>
                : <div key={it.label} className={cls} title={`${it.label} — в прототипе недоступно`}>{inner}</div>;
            })}
          </div>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card px-4">
          <button onClick={() => setOpen(!open)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Свернуть меню"><Menu className="h-4 w-4" /></button>
          <span className="font-semibold">CRM IT-парк</span>
          <span className="ml-auto text-xs text-muted-foreground">прототип · данные inventory-hub</span>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive", neutral: "bg-muted text-muted-foreground", info: "bg-accent text-accent-foreground",
};
export type Tone = keyof typeof TONES;
export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", TONES[tone], className)}>{children}</span>;
}
export function Panel({ title, subtitle, actions, children, className }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      {title && <div className="flex items-start justify-between gap-3 border-b px-4 py-3"><div><h2 className="font-semibold">{title}</h2>{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}</div>{actions}</div>}
      {children}
    </section>
  );
}
