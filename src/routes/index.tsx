import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  ArrowLeftRight,
  Monitor,
  Printer,
  Network,
  HardDrive,
} from "lucide-react";
import { ASSETS, splitList } from "@/lib/assets";
import { PageHeader, Panel, Pill } from "@/components/crm/Shell";
import { StatusBadge, SyncBadge } from "@/components/crm/badges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Дашборд — CRM IT-парк" },
      { name: "description", content: "Сводка по парку ИТ-оборудования, защите и обслуживанию." },
      { property: "og:title", content: "Дашборд — CRM IT-парк" },
      {
        property: "og:description",
        content: "Сводка по парку ИТ-оборудования, защите и обслуживанию.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const btn =
  "inline-flex h-9 items-center rounded-md border bg-card px-4 text-sm font-medium hover:bg-muted";
function Dashboard() {
  const c = (f: (a: (typeof ASSETS)[0]) => boolean) => ASSETS.filter(f).length;
  const printers = new Set(ASSETS.flatMap((a) => splitList(a.printers))).size;
  const conflicts = c((a) => a.sync === "conflict");
  const recent = [...ASSETS].sort((a, b) => b.observed.localeCompare(a.observed)).slice(0, 8);
  return (
    <>
      <PageHeader
        title="Дашборд"
        subtitle="Сводка по парку, защите и обслуживанию"
        actions={
          <>
            <Link
              to="/assets"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Открыть реестр
            </Link>
            <Link to="/integrations" className={btn}>
              Интеграции
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat
          label="Всего оборудования"
          value={ASSETS.length}
          sub={`в работе: ${c((a) => a.status === "active")} · в ремонте: ${c((a) => a.status === "repair")}`}
        />
        <Stat
          label="ПК и ноутбуки"
          value={ASSETS.length}
          sub={`принтеров: ${printers} · списано: ${c((a) => a.status === "decommissioned")}`}
        />
        <Stat label="Интеграции" value="4 / 4" sub="включено · требуют внимания: 1" />
        <Stat
          label="Расхождения"
          value={conflicts}
          sub={`ожидают синхронизации: ${c((a) => a.sync === "pending")}`}
          tone
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Integ
          icon={ShieldCheck}
          name="Антивирус (KSC)"
          sub="Kaspersky Security Center"
          rows={[
            ["Сервер", "10.177.105.41"],
            ["Агентов", String(c((a) => a.ksc.agent !== "нет агента"))],
          ]}
        />
        <Integ
          icon={Users}
          name="Домен AD"
          sub="Active Directory"
          rows={[
            ["Сервер", "dc01;dc02;dc03"],
            ["Учёток ПК", String(c((a) => a.ad.enabled))],
          ]}
        />
        <Integ
          icon={ArrowLeftRight}
          name="Инвентаризация TNI"
          sub="Total Network Inventory"
          rows={[
            ["Источник", "inventory-hub"],
            ["Активов из TNI", String(c((a) => a.source === "TNI"))],
          ]}
        />
      </div>
      <Panel
        className="mt-4"
        title="Структура парка оборудования"
        subtitle="Распределение по ключевым типам устройств"
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            [Monitor, "ПК и ноутбуки", ASSETS.length],
            [Printer, "Принтеры и МФУ", printers],
            [Network, "Сетевое оборуд.", 0],
            [HardDrive, "СХД", 0],
          ].map(([I, l, v]) => {
            const Icon = I as typeof Monitor;
            return (
              <div key={l as string} className="flex items-center gap-3 rounded-lg border p-4">
                <span className="rounded-md bg-accent p-2 text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm text-muted-foreground">{l as string}</div>
                  <div className="text-lg font-bold">{v as number}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel
        className="mt-4"
        title="Недавно обновлённое оборудование"
        subtitle="Последние записи реестра"
        actions={
          <Link to="/assets" className={btn}>
            Открыть реестр →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Инв. №", "Имя ПК", "МОЛ", "IP", "Состояние", "Синхр."].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-2.5 font-mono">{a.inv || "—"}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      to="/assets/$id"
                      params={{ id: String(a.id) }}
                      className="font-medium text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{a.mol}</td>
                  <td className="px-4 py-2.5 font-mono">{a.ip || "—"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge s={a.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <SyncBadge s={a.sync} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${tone ? "text-destructive" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
function Integ({
  icon: Icon,
  name,
  sub,
  rows,
}: {
  icon: typeof Users;
  name: string;
  sub: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-md bg-accent p-2 text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <Pill tone="success">подключён</Pill>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-mono">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
