import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Lock, Monitor, Printer, Wifi, WifiOff } from "lucide-react";
import { getAsset, splitList, type Asset } from "@/lib/assets";
import { Panel, Pill } from "@/components/crm/Shell";
import { StatusBadge, SyncBadge, SourceBadge } from "@/components/crm/badges";
import { cn } from "@/lib/utils";
import { antivirusRows } from "@/components/crm/AntivirusDetails";
import { antivirusSections } from "@/lib/antivirus";
import { Button } from "@/components/ui/button";
import { agentInstallation, agentAvailability } from "@/lib/ksc-agent";
import { LocalSecurityMatcher } from "@/components/crm/LocalSecurityMatcher";

export const Route = createFileRoute("/assets/$id")({
  loader: ({ params }) => {
    const a = getAsset(Number(params.id));
    if (!a) throw notFound();
    return { id: a.id, name: a.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.name} — карточка устройства` : "Устройство — CRM IT-парк",
      },
      {
        name: "description",
        content: "Карточка устройства: железо, CRM-поля, данные TNI, KSC, AD и MeshCentral.",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.name} — CRM IT-парк` : "Устройство — CRM IT-парк",
      },
      { property: "og:description", content: "Карточка устройства со сводкой по всем источникам." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Card,
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <p className="mb-4">Устройство не найдено.</p>
      <Link to="/assets" className="text-primary underline">
        В реестр
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => <div role="alert">{String(error)}</div>,
});

const TABS = ["Сводка", "TNI", "Антивирус", "Active Directory", "MeshCentral", "История"] as const;
const DISC_TITLE = {
  nagent: "Просрочен nagent",
  ip: "Несоответствие IP",
  name: "Несоответствие имени",
  anchor: "Нет сильных якорей",
  new: "Новое устройство",
  other: "Проверка данных",
};

function Card() {
  const { id } = Route.useLoaderData();
  const a = getAsset(id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Сводка");
  if (!a) throw notFound();
  return (
    <>
      <Link
        to="/assets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Реестр
      </Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">{a.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Инв. № <b className="font-mono text-foreground">{a.inv || "—"}</b>
            </span>
            ·<span>{a.dept}</span>·<StatusBadge s={a.status} />
            <SyncBadge s={a.sync} />
            <SourceBadge s={a.source} />
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          observed_at<div className="font-mono text-sm text-foreground">{a.observed || "—"}</div>
        </div>
      </div>
      {a.discrepancies.length > 0 && (
        <div className="mb-5 space-y-2">
          {a.discrepancies.map((d, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
                d.kind === "nagent" || d.kind === "ip" || d.kind === "name"
                  ? "border-destructive/30 bg-danger-soft"
                  : "border-warning/30 bg-warning-soft",
              )}
            >
              <AlertTriangle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  d.kind === "nagent" || d.kind === "ip" || d.kind === "name"
                    ? "text-destructive"
                    : "text-warning",
                )}
              />
              <div>
                <div className="font-semibold">{DISC_TITLE[d.kind]}</div>
                <div className="text-muted-foreground">{d.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <Button
            variant="ghost"
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cn(
              "h-10 rounded-none border-b-2 px-4 py-2 text-sm font-medium",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </Button>
        ))}
      </div>
      {tab === "Сводка" && <Summary a={a} />}
      {tab === "TNI" && <Tni a={a} />}
      {tab === "Антивирус" && <AntivirusTab a={a} />}
      {tab === "Active Directory" && <Ad a={a} />}
      {tab === "MeshCentral" && <Mesh a={a} />}
      {tab === "История" && <History a={a} />}
    </>
  );
}

function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y text-sm">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-3"
        >
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 break-words font-mono text-[13px]">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function Summary({ a }: { a: Asset }) {
  const mons = splitList(a.monitors),
    prs = splitList(a.printers);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Общая сводка" subtitle="Данные inventory-hub" className="lg:col-span-2">
        <KV
          rows={[
            ["Инвентарный №", a.inv],
            ["Имя ПК", a.name],
            ["ОС", `${a.os} ${a.arch}`],
            ["ЦП", a.cpu && `${a.cpu} · ${a.cores} ядер`],
            ["ОЗУ", a.ram && `${a.ram} ГБ · ${a.memType}`],
            ["Накопители", a.disk && `${a.disk} · ${a.diskType}`],
            ["IP-адрес", a.ip],
            ["MAC-адрес", a.mac],
            ["Серийный №", a.serial],
            ["Текущий пользователь", a.user],
          ]}
        />
      </Panel>
      <div className="space-y-4">
        <Panel title="Антивирус">
          <KV rows={antivirusRows(a.antivirus)} />
        </Panel>
        <Panel
          title="CRM-поля"
          subtitle="Заполняются CRM / 1С, не перезаписываются синхронизацией"
          actions={<Lock className="h-4 w-4 text-muted-foreground" />}
        >
          <KV
            rows={[
              ["МОЛ", a.mol],
              ["Должность", a.molPosition],
              ["Владелец", a.owner],
              [
                "Статус сотрудника",
                <Pill tone={a.employeeStatus === "работает" ? "success" : "danger"}>
                  {a.employeeStatus}
                </Pill>,
              ],
            ]}
          />
        </Panel>
        <Panel title="Периферия">
          <ul className="divide-y text-sm">
            {mons.map((m) => (
              <li key={m} className="flex gap-2 px-4 py-2.5">
                <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                {m}
              </li>
            ))}
            {prs.map((m) => (
              <li key={m} className="flex gap-2 px-4 py-2.5">
                <Printer className="h-4 w-4 shrink-0 text-muted-foreground" />
                {m}
              </li>
            ))}
            {!mons.length && !prs.length && (
              <li className="px-4 py-6 text-center text-muted-foreground">
                Периферия не обнаружена
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
function Tni({ a }: { a: Asset }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Железо (TNI)">
        <KV
          rows={[
            ["Материнская плата", [a.mbManuf, a.mbModel].filter(Boolean).join(" ")],
            ["Процессор", a.cpu],
            ["Ядер", a.cores],
            ["Память", a.ram && `${a.ram} ГБ`],
            ["Тип памяти", a.memType],
            ["Диски", a.disk],
            ["Тип диска", a.diskType],
            ["Архитектура", a.arch],
            ["Мониторы", a.monitors],
          ]}
        />
      </Panel>
      <Panel title="Программное обеспечение" subtitle={`${a.software.length} пакетов`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Название</th>
                <th className="px-4 py-2">Версия</th>
                <th className="px-4 py-2">Издатель</th>
              </tr>
            </thead>
            <tbody>
              {a.software.map((s) => (
                <tr key={s.name} className="border-t">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.version}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{s.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
function AntivirusTab({ a }: { a: Asset }) {
  const k = a.ksc;
  const installed = agentInstallation(a.ksc_agent_installed);
  const available = agentAvailability(k.agent);
  const sections = antivirusSections(a.antivirus);
  return (
    <div className="max-w-4xl space-y-6">
      <section aria-labelledby="ksc-heading">
        <div className="mb-3">
          <h2 id="ksc-heading" className="text-lg font-semibold">
            KSC
          </h2>
          <p className="text-xs text-muted-foreground">
            Kaspersky Security Center · 10.177.105.41:13299
          </p>
        </div>
        {sections.ksc ? (
          <KV rows={antivirusRows(sections.ksc)} />
        ) : (
          <p className="border-b px-4 py-3 text-sm text-muted-foreground">
            Данные об антивирусе из KSC не получены.
          </p>
        )}
        <KV
          rows={[
            [
              "Агент KSC установлен",
              <Pill
                tone={
                  installed === "установлен"
                    ? "success"
                    : installed === "не установлен"
                      ? "danger"
                      : "neutral"
                }
              >
                {installed}
              </Pill>,
            ],
            [
              "Доступность агента (пример)",
              <Pill
                tone={
                  available === "отвечает"
                    ? "success"
                    : available === "не отвечает"
                      ? "warning"
                      : "neutral"
                }
              >
                {available}
              </Pill>,
            ],
            ["Последний nagent", k.nagentAt],
            ["Последняя видимость", k.visibleAt],
            [
              "Антивирусные базы",
              <span>
                {k.avBases}{" "}
                <Pill tone={k.avStatus === "актуальны" ? "success" : "warning"}>{k.avStatus}</Pill>
              </span>,
            ],
            ["Политика", k.policy],
            ["Группа администрирования", k.group],
            ["Версия KES", k.version],
          ]}
        />
      </section>
      <section aria-labelledby="other-antivirus-heading">
        <h2 id="other-antivirus-heading" className="mb-3 text-lg font-semibold">
          Иные антивирусы
        </h2>
        {a.otherAntiviruses.length ? (
          a.otherAntiviruses.map((av, i) => (
            <div key={`${av.name}-${i}`} className="mb-4">
              <KV rows={antivirusRows(av, true)} />
            </div>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">
            Данные об иных антивирусах не получены.
          </p>
        )}
      </section>
      <LocalSecurityMatcher />
    </div>
  );
}
function Ad({ a }: { a: Asset }) {
  return (
    <Panel title="Active Directory" subtitle="sbyt.minsk.energo.net" className="max-w-4xl">
      <KV
        rows={[
          [
            "Учётная запись",
            <Pill tone={a.ad.enabled ? "success" : "neutral"}>
              {a.ad.enabled ? "включена" : "выключена"}
            </Pill>,
          ],
          ["DN", a.ad.dn],
          ["OU", a.ad.ou],
          [
            "Группы",
            <div className="flex flex-wrap gap-1">
              {a.ad.groups.map((g) => (
                <Pill key={g} tone="info">
                  {g}
                </Pill>
              ))}
            </div>,
          ],
          ["lastLogonTimestamp", a.ad.lastLogon],
        ]}
      />
    </Panel>
  );
}
function Mesh({ a }: { a: Asset }) {
  const m = a.mesh;
  return (
    <Panel title="MeshCentral" subtitle="Удалённый доступ" className="max-w-3xl">
      <div className="flex items-center gap-3 border-b px-4 py-4">
        {m.online ? (
          <Wifi className="h-5 w-5 text-success" />
        ) : (
          <WifiOff className="h-5 w-5 text-muted-foreground" />
        )}
        <Pill tone={m.online ? "success" : "neutral"}>{m.online ? "online" : "offline"}</Pill>
        <button
          disabled={!m.online}
          className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          Подключиться
        </button>
      </div>
      <KV
        rows={[
          ["Последняя активность", m.lastSeen],
          ["Node ID", m.nodeId],
          ["RDP разрешён", m.rdp ? "да" : "нет"],
          ["Версия агента", m.agentVer],
        ]}
      />
    </Panel>
  );
}
function History({ a }: { a: Asset }) {
  return (
    <Panel title="История аудита и изменений">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              {["Когда", "Кто", "Источник", "Поле", "Было", "Стало"].map((h) => (
                <th key={h} className="px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.audit.map((e, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2.5 font-mono text-xs">{e.at}</td>
                <td className="px-4 py-2.5">{e.who}</td>
                <td className="px-4 py-2.5">
                  <SourceBadge s={e.source} />
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{e.field}</td>
                <td className="px-4 py-2.5 text-muted-foreground line-through">{e.from}</td>
                <td className="px-4 py-2.5">{e.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
