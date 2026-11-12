import { AlertTriangle, Clock, Cpu, Monitor, Printer, Server, ShieldAlert, Network, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Asset,
  SOURCES,
  formatMinutes,
  parseCheckFlag,
  relatedBySource,
  splitList,
} from "@/lib/asset";

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Cpu; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

function parseMonitor(m: string) {
  const sn = m.match(/S\/N\s*([^,)]+)/)?.[1];
  const size = m.match(/([\d.]+)"/)?.[1];
  const model = m.replace(/\s*\(.*\)\s*$/, "").replace(/\s{2,}/g, " ");
  return { model, sn, size };
}

function parsePrinter(p: string) {
  const port = p.match(/\[([^\]]+)\]/)?.[1];
  return { name: p.replace(/\s*\[[^\]]+\]/, ""), port };
}

function HardwareFields({ a }: { a: Asset }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      <Field label="ОС" value={a.os_name} />
      <Field label="Архитектура" value={a.architecture} />
      <Field label="Процессор" value={a.cpu} />
      <Field label="Ядер" value={a.cpu_cores} />
      <Field label="ОЗУ" value={a.ram_gb != null ? `${a.ram_gb} ГБ · ${a.mem_type ?? "—"}` : null} />
      <Field label="Диски" value={a.disk_model ? `${a.disk_model} · ${a.disk_type ?? ""}` : null} />
      <Field label="Мат. плата" value={[a.mb_manuf, a.mb_model].filter(Boolean).join(" · ") || null} />
      <Field label="MAC (физ.)" value={a.mac_address} mono />
    </div>
  );
}

export function DeviceCard({ asset, onSelect }: { asset: Asset; onSelect: (id: number) => void }) {
  const flags = parseCheckFlag(asset.check_flag);
  const related = relatedBySource(asset);
  const monitors = splitList(asset.monitors);
  const printers = splitList(asset.printers);

  return (
    <article className="flex flex-col gap-4">
      <header className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Server className="h-3.5 w-3.5" /> Актив #{asset.id}
            </div>
            <h2 className="mt-1 font-mono text-2xl font-semibold text-card-foreground">{asset.short_name}</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {asset.ip_address ?? "без IP"} · инв. № {asset.inventory_no ?? "—"} · S/N {asset.serial_number ?? "—"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="font-mono">{asset.source}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {asset.observed_at}
            </span>
          </div>
        </div>

        {(flags.nagentOverdueMin != null || flags.nameMatch || flags.other.length > 0) && (
          <div className="mt-4 flex flex-col gap-2">
            {flags.nagentOverdueMin != null && (
              <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <b className="text-foreground">Просрочен nagent</b>
                  <div className="text-muted-foreground">
                    KSC: nagent/visible расходятся на {formatMinutes(flags.nagentOverdueMin)} (
                    {flags.nagentOverdueMin.toLocaleString("ru")} мин, порог 10)
                  </div>
                </div>
              </div>
            )}
            {flags.nameMatch && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <b className="text-foreground">Имя совпадает с TNI, другой IP</b>
                  <div className="text-muted-foreground">
                    В TNI: <span className="font-mono">{flags.nameMatch.tniName}</span> ·{" "}
                    <span className="font-mono">{flags.nameMatch.tniIp}</span> — другой участок, не объединять.
                  </div>
                  {related.TNI[0] && (
                    <button
                      onClick={() => onSelect(related.TNI[0]!.id)}
                      className="mt-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Открыть запись TNI →
                    </button>
                  )}
                </div>
              </div>
            )}
            {flags.other.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {flags.other.map((o) => (
                  <Badge key={o} variant="secondary" className="whitespace-normal text-left font-normal">
                    <AlertTriangle className="mr-1 h-3 w-3" /> {o}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section icon={Cpu} title="Основная информация">
            <HardwareFields a={asset} />
            <Field label="Текущий пользователь" value={asset.current_user} mono />
          </Section>
        </div>
        <div className="flex flex-col gap-4">
          <Section icon={Monitor} title={`Мониторы (${monitors.length})`}>
            {monitors.length === 0 && <p className="text-sm text-muted-foreground">Нет подтверждённых</p>}
            <ul className="flex flex-col gap-2">
              {monitors.map((m, i) => {
                const p = parseMonitor(m);
                return (
                  <li key={i} className="rounded-md bg-muted p-2 text-sm">
                    <div className="font-medium text-foreground">{p.model}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      S/N {p.sn ?? "—"}{p.size ? ` · ${p.size}"` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
          <Section icon={Printer} title={`Принтеры (${printers.length})`}>
            {printers.length === 0 && <p className="text-sm text-muted-foreground">Нет локальных</p>}
            <ul className="flex flex-col gap-2">
              {printers.map((pr, i) => {
                const p = parsePrinter(pr);
                return (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-muted p-2 text-sm">
                    <span className="text-foreground">{p.name}</span>
                    {p.port && <Badge variant="outline" className="font-mono text-[10px]">{p.port}</Badge>}
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>
      </div>

      <Section icon={Network} title="Данные по источникам">
        <Tabs defaultValue={asset.source} key={asset.id}>
          <TabsList>
            {SOURCES.map((s) => (
              <TabsTrigger key={s} value={s} className="gap-1.5 font-mono">
                {s}
                <span className="rounded bg-background/60 px-1 text-[10px]">{related[s].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {SOURCES.map((s) => (
            <TabsContent key={s} value={s} className="pt-2">
              {related[s].length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {s === "Mesh" ? "Mesh пока не подключён в выгрузке inventory-hub." : `Запись в ${s} не найдена.`}
                </p>
              ) : (
                related[s].map((r) => (
                  <div key={r.id} className={`mb-3 rounded-md border p-3 ${r.id === asset.id ? "border-primary/50" : "border-border"}`}>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-foreground">
                        {r.short_name} · {r.ip_address ?? "без IP"} · {r.observed_at}
                      </span>
                      {r.id === asset.id ? (
                        <Badge>текущая</Badge>
                      ) : (
                        <button onClick={() => onSelect(r.id)} className="font-medium text-primary hover:underline">
                          Открыть #{r.id}
                        </button>
                      )}
                    </div>
                    <HardwareFields a={r} />
                    <p className="mt-2 text-xs text-muted-foreground">check_flag: {r.check_flag}</p>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      <Section icon={Lock} title="Поля CRM (из 1С, не перезаписываются inventory-hub)">
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          <Field label="МОЛ" value={null} />
          <Field label="Должность МОЛ" value={null} />
          <Field label="Владелец" value={null} />
          <Field label="Статус сотрудника" value={null} />
        </div>
      </Section>
    </article>
  );
}
