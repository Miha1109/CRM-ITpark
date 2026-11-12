import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plug } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/crm/Shell";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [
    { title: "Интеграции — CRM IT-парк" }, { name: "description", content: "Подключения к KSC, AD, TNI и MeshCentral и журнал проверок." },
    { property: "og:title", content: "Интеграции — CRM IT-парк" }, { property: "og:description", content: "Подключения к KSC, AD, TNI и MeshCentral." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Integrations,
});
const INT = [
  { code: "AD", name: "Active Directory", proto: "LDAP / LDAPS", host: "dc01, dc02, dc03 :636", note: "Домен: sbyt.minsk.energo.net", ok: null },
  { code: "KSC", name: "Kaspersky Security Center", proto: "API (HTTP/REST)", host: "10.177.105.41 :13299", note: "авторизация в KSC выполнена", ok: true },
  { code: "TNI", name: "Total Network Inventory", proto: "inventory-hub", host: "10.177.100.46", note: "последний sync: sync-20261110-001", ok: true },
  { code: "Mesh", name: "MeshCentral", proto: "WebSocket API", host: "mesh.sbyt.local :443", note: "токен истекает через 3 дня", ok: false },
];
const LOG = [
  ["01.11.2026 14:09:41", "успешно", "авторизация в KSC выполнена"], ["01.11.2026 12:33:02", "успешно", "авторизация в KSC выполнена"],
  ["01.11.2026 12:31:35", "успешно", "авторизация в KSC выполнена"],
  ["01.11.2026 11:50:36", "ошибка", "KSC отклонил доменную учётку: для basic-входа нужен внутренний пользователь KSC (доменные — только через Windows-аутентификацию)"],
  ["01.11.2026 11:45:45", "ошибка", "KSC отклонил доменную учётку: для basic-входа нужен внутренний пользователь KSC"], ["01.11.2026 11:44:48", "ошибка", "KSC отклонил учётные данные"],
];
const btn = "rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted";
function Integrations() {
  const [f, setF] = useState<"" | "успешно" | "ошибка">("");
  const rows = LOG.filter((l) => !f || l[1] === f);
  return (
    <>
      <PageHeader title="Интеграции" subtitle="Внешние системы: KSC, AD, TNI, MeshCentral, 1С" actions={<button className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Новая интеграция</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {INT.map((i) => (
          <div key={i.code} className="rounded-lg border bg-card p-5">
            <div className="flex items-start gap-3"><span className="rounded-md bg-sidebar p-2.5 text-sidebar-foreground"><Plug className="h-4 w-4" /></span>
              <div className="flex-1"><div className="font-semibold">{i.code}</div><div className="text-xs text-muted-foreground">{i.name}</div></div>
              <Pill tone={i.ok === null ? "warning" : i.ok ? "success" : "danger"}>{i.ok === null ? "не проверялась" : i.ok ? "работает" : "требует внимания"}</Pill></div>
            <div className="mt-4 flex flex-wrap gap-x-5 text-sm text-muted-foreground"><span>{i.proto}</span><span className="font-mono">{i.host}</span></div>
            <div className="mt-2 text-xs text-muted-foreground">{i.note}</div>
            <div className="mt-4 flex gap-2"><button className={btn}>Проверить</button><button className={btn}>Изменить</button><button className="rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-danger-soft">Удалить</button></div>
          </div>))}
      </div>
      <Panel className="mt-6" title="Журнал проверок" subtitle="История успешных и неуспешных проверок подключения" actions={
        <div className="flex gap-2">{([["", "Все"], ["успешно", "Успешные"], ["ошибка", "Ошибки"]] as const).map(([k, l]) => (
          <button key={l} onClick={() => setF(k)} className={f === k ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground" : btn}>{l} <span className="opacity-70">{LOG.filter((x) => !k || x[1] === k).length}</span></button>))}</div>}>
        <table className="w-full text-sm"><thead className="bg-muted text-left text-[11px] uppercase text-muted-foreground"><tr>{["Когда", "Интеграция", "Операция", "Результат", "Сообщение"].map((h) => <th key={h} className="px-4 py-2.5">{h}</th>)}</tr></thead>
          <tbody>{rows.map((l) => <tr key={l[0]} className="border-t"><td className="px-4 py-3 font-mono text-xs">{l[0]}</td><td className="px-4 py-3">Kaspersky Security Center</td><td className="px-4 py-3">Проверка</td><td className="px-4 py-3"><Pill tone={l[1] === "успешно" ? "success" : "danger"}>{l[1]}</Pill></td><td className="px-4 py-3">{l[2]}</td></tr>)}</tbody></table>
      </Panel>
    </>
  );
}
