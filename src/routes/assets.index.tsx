import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, AlertTriangle, Download } from "lucide-react";
import { ASSETS, DEPARTMENTS, STATUS_LABEL } from "@/lib/assets";
import { PageHeader, Panel, Pill } from "@/components/crm/Shell";
import { StatusBadge, SyncBadge, SourceBadge } from "@/components/crm/badges";
import { Button } from "@/components/ui/button";
import { AntivirusStatus } from "@/components/crm/AntivirusDetails";
import { inventoryCsv } from "@/lib/inventory-csv";
import { matchesAntivirusFilter } from "@/lib/antivirus";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "").default(""),
  dept: fallback(z.string(), "").default(""),
  source: fallback(z.string(), "").default(""),
  flags: fallback(z.boolean(), false).default(false),
  page: fallback(z.number().int(), 1).default(1),
  antivirus: fallback(z.string(), "").default(""),
  protection: fallback(z.string(), "").default(""),
});
export const Route = createFileRoute("/assets/")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Реестр оборудования — CRM IT-парк" },
      {
        name: "description",
        content: "Реестр ПК с поиском, фильтрами и флагами расхождений между источниками.",
      },
      { property: "og:title", content: "Реестр оборудования — CRM IT-парк" },
      {
        property: "og:description",
        content: "Реестр ПК с поиском, фильтрами и флагами расхождений.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registry,
});
const PER = 50;
const sel = "h-9 rounded-md border bg-card px-2 text-sm";
const avRecords = (a: (typeof ASSETS)[number]) => [a.antivirus, ...a.otherAntiviruses];
const AV_NAMES = [
  ...new Set(ASSETS.flatMap((a) => avRecords(a).map((r) => r.name)).filter(Boolean)),
].sort();
const AV_STATUSES = [
  ...new Set(ASSETS.flatMap((a) => avRecords(a).map((r) => r.status)).filter(Boolean)),
].sort();

function Registry() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/assets/" });
  const set = (p: Partial<typeof s>) =>
    nav({ search: (prev) => ({ ...prev, page: 1, ...p }), replace: true });
  const q = s.q.trim().toLowerCase();
  const list = ASSETS.filter(
    (a) =>
      (!q ||
        [a.name, a.ip, a.inv, a.serial, a.mac, a.user, a.mol].some((v) =>
          v.toLowerCase().includes(q),
        )) &&
      (!s.status || a.status === s.status) &&
      (!s.dept || a.dept === s.dept) &&
      (!s.source || a.source === s.source) &&
      (!s.flags || a.discrepancies.length > 0) &&
      matchesAntivirusFilter(avRecords(a), s.antivirus, s.protection),
  );
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const page = Math.min(Math.max(1, s.page), pages);
  const rows = list.slice((page - 1) * PER, page * PER);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([inventoryCsv(list)], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pc_inventory_union.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageHeader
        title="Оборудование (реестр)"
        subtitle={`ПК и ноутбуки · найдено ${list.length} из ${ASSETS.length} · с антивирусом: ${list.filter((a) => a.antivirus.name).length}`}
        actions={
          <Button variant="outline" onClick={download}>
            <Download />
            CSV
          </Button>
        }
      />
      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={s.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Имя ПК, IP, инв. №, S/N, MAC, пользователь…"
              className="h-9 w-full rounded-md border bg-card pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            className={sel}
            value={s.status}
            onChange={(e) => set({ status: e.target.value })}
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select className={sel} value={s.dept} onChange={(e) => set({ dept: e.target.value })}>
            <option value="">Все подразделения</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            className={sel}
            value={s.source}
            onChange={(e) => set({ source: e.target.value })}
          >
            <option value="">Все источники</option>
            {["TNI", "KSC", "AD", "Mesh"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <label className="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm">
            <input
              type="checkbox"
              checked={s.flags}
              onChange={(e) => set({ flags: e.target.checked })}
            />
            Только с расхождениями
          </label>
          <select
            aria-label="Антивирус"
            className={sel}
            value={s.antivirus}
            onChange={(e) => set({ antivirus: e.target.value })}
          >
            <option value="">Все антивирусы</option>
            {AV_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value="__unknown">Антивирус: нет данных</option>
          </select>
          <select
            aria-label="Статус защиты"
            className={sel}
            value={s.protection}
            onChange={(e) => set({ protection: e.target.value })}
          >
            <option value="">Все статусы защиты</option>
            {AV_STATUSES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value="__unknown">Защита: нет данных</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                {[
                  "Инв. №",
                  "Имя ПК",
                  "IP",
                  "ОС",
                  "Подразделение",
                  "МОЛ",
                  "Антивирус (название)",
                  "Антивирус (версия)",
                  "Антивирус (статус)",
                  "Антивирус (источник)",
                  "Источник",
                  "Статус",
                  "Синхр.",
                  "Флаги",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/50">
                  <td className="px-3 py-2 font-mono">{a.inv || "—"}</td>
                  <td className="px-3 py-2">
                    <Link
                      to="/assets/$id"
                      params={{ id: String(a.id) }}
                      className="font-medium text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{a.ip || "—"}</td>
                  <td className="max-w-36 truncate px-3 py-2 text-xs" title={a.os}>
                    {a.os || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{a.dept}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{a.mol}</td>
                  <td className="min-w-48 px-3 py-2 text-xs">
                    {a.antivirus.name || <span className="text-muted-foreground">нет данных</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {a.antivirus.version || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <AntivirusStatus status={a.antivirus.status} />
                  </td>
                  <td className="px-3 py-2">
                    {a.antivirus.source ? <SourceBadge s={a.antivirus.source} /> : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <SourceBadge s={a.source} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge s={a.status} />
                  </td>
                  <td className="px-3 py-2">
                    <SyncBadge s={a.sync} />
                  </td>
                  <td className="px-3 py-2">
                    {a.discrepancies.length ? (
                      <span title={a.discrepancies.map((d) => d.text).join("\n")}>
                        <Pill tone="warning">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {a.discrepancies.length}
                        </Pill>
                      </span>
                    ) : (
                      <Pill tone="success">ok</Pill>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-muted-foreground">
                    Ничего не найдено. Измените фильтры.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Стр. {page} из {pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => nav({ search: (p) => ({ ...p, page: page - 1 }) })}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              ← Назад
            </button>
            <button
              disabled={page >= pages}
              onClick={() => nav({ search: (p) => ({ ...p, page: page + 1 }) })}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              Вперёд →
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
