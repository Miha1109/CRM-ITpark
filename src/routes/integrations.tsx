import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plug, Plus, RefreshCw, Settings, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/crm/Shell";
import {
  IntegrationConfigDialog,
  type IntegrationItem,
  type TestResult,
} from "@/components/crm/IntegrationConfigDialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Интеграции — CRM IT-парк" },
      { name: "description", content: "Подключения к KSC, AD, TNI и MeshCentral и журнал проверок." },
      { property: "og:title", content: "Интеграции — CRM IT-парк" },
      { property: "og:description", content: "Подключения к KSC, AD, TNI и MeshCentral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Integrations,
});

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "int-ad",
    code: "AD",
    name: "Active Directory",
    proto: "LDAP / LDAPS",
    host: "dc01, dc02, dc03",
    port: 636,
    note: "Домен: sbyt.minsk.energo.net",
    ok: null,
    domain: "sbyt.minsk.energo.net",
    baseDn: "DC=sbyt,DC=minsk,DC=energo,DC=net",
    useSsl: true,
  },
  {
    id: "int-ksc",
    code: "KSC",
    name: "Kaspersky Security Center",
    proto: "API (HTTP/REST)",
    host: "10.177.105.41",
    port: 13299,
    note: "авторизация в KSC выполнена",
    ok: true,
    authType: "basic",
    username: "ksc_service_user",
    useSsl: true,
    allowSelfSigned: true,
  },
  {
    id: "int-tni",
    code: "TNI",
    name: "Total Network Inventory",
    proto: "inventory-hub",
    host: "10.177.100.46",
    port: 445,
    note: "последний sync: sync-20261110-001",
    ok: true,
    authType: "agent",
    useSsl: false,
  },
  {
    id: "int-mesh",
    code: "Mesh",
    name: "MeshCentral",
    proto: "WebSocket API",
    host: "mesh.sbyt.local",
    port: 443,
    note: "токен истекает через 3 дня",
    ok: false,
    authType: "token",
    useSsl: true,
  },
];

type LogEntry = [timestamp: string, status: "успешно" | "ошибка", message: string, systemName: string];

const INITIAL_LOGS: LogEntry[] = [
  ["01.11.2026 14:09:41", "успешно", "авторизация в KSC выполнена", "Kaspersky Security Center"],
  ["01.11.2026 12:33:02", "успешно", "авторизация в KSC выполнена", "Kaspersky Security Center"],
  ["01.11.2026 12:31:35", "успешно", "авторизация в KSC выполнена", "Kaspersky Security Center"],
  [
    "01.11.2026 11:50:36",
    "ошибка",
    "KSC отклонил доменную учётку: для basic-входа нужен внутренний пользователь KSC (доменные — только через Windows-аутентификацию)",
    "Kaspersky Security Center",
  ],
  [
    "01.11.2026 11:45:45",
    "ошибка",
    "KSC отклонил доменную учётку: для basic-входа нужен внутренний пользователь KSC",
    "Kaspersky Security Center",
  ],
  ["01.11.2026 11:44:48", "ошибка", "KSC отклонил учётные данные", "Kaspersky Security Center"],
];

const btn = "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors";

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [f, setF] = useState<"" | "успешно" | "ошибка">("");

  // Modal dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationItem | null>(null);
  const [checkingCode, setCheckingCode] = useState<string | null>(null);

  const rows = logs.filter((l) => !f || l[1] === f);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: IntegrationItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (code: string) => {
    const item = integrations.find((i) => i.code === code);
    if (!item) return;
    setIntegrations((prev) => prev.filter((i) => i.code !== code));
    toast.success(`Интеграция ${item.name} удалена`);
  };

  const handleSave = (savedItem: IntegrationItem) => {
    setIntegrations((prev) => {
      const existsIndex = prev.findIndex((i) => i.code === savedItem.code || i.id === savedItem.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedItem;
        return updated;
      }
      return [...prev, savedItem];
    });

    const statusText = savedItem.ok ? "успешно" : savedItem.ok === false ? "ошибка" : "успешно";
    const msg = savedItem.ok
      ? `Конфигурация ${savedItem.name} обновлена, проверка связи успешна`
      : `Конфигурация ${savedItem.name} сохранена (${savedItem.proto} ${savedItem.host})`;

    setLogs((prev) => [[formatTimestamp(), statusText, msg, savedItem.name], ...prev]);
    toast.success(`Интеграция "${savedItem.name}" сохранена`);
  };

  const handleQuickCheck = async (item: IntegrationItem) => {
    setCheckingCode(item.code);
    toast.info(`Проверка связи с ${item.name}...`);

    setTimeout(() => {
      setCheckingCode(null);

      // KSC domain auth special case check
      const isDomainUser = item.username && (item.username.includes("@") || item.username.includes("\\"));
      const isSuccess = !(item.code === "KSC" && isDomainUser);

      setIntegrations((prev) =>
        prev.map((i) => (i.code === item.code ? { ...i, ok: isSuccess } : i))
      );

      const msg = isSuccess
        ? `Соединение с ${item.name} по ${item.proto} подтверждено (время отклика: 24 мс)`
        : `KSC отклонил доменную учётку: для basic-входа нужен внутренний пользователь KSC`;

      setLogs((prev) => [
        [formatTimestamp(), isSuccess ? "успешно" : "ошибка", msg, item.name],
        ...prev,
      ]);

      if (isSuccess) {
        toast.success(`Связь с ${item.name} работает`);
      } else {
        toast.error(`Ошибка связи с ${item.name}: требуется проверка параметров`);
      }
    }, 600);
  };

  return (
    <>
      <Toaster position="top-right" />

      <PageHeader
        title="Интеграции"
        subtitle="Внешние системы: KSC, AD, TNI, MeshCentral, 1С"
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Новая интеграция</span>
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((i) => {
          const isChecking = checkingCode === i.code;
          const hostDisplay = i.port ? `${i.host} :${i.port}` : i.host;

          return (
            <div key={i.code} className="flex flex-col justify-between rounded-lg border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
              <div>
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-sidebar p-2.5 text-sidebar-foreground">
                    <Plug className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{i.code}</span>
                      <span className="text-xs text-muted-foreground">({i.name})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{i.proto}</span>
                      <span className="font-mono">{hostDisplay}</span>
                    </div>
                  </div>
                  <Pill tone={i.ok === null ? "warning" : i.ok ? "success" : "danger"}>
                    {i.ok === null ? "не проверялась" : i.ok ? "работает" : "требует внимания"}
                  </Pill>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  {i.note || "Параметры соединения настроены"}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => handleQuickCheck(i)}
                  disabled={isChecking}
                  className={btn}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin text-primary" : ""}`} />
                  <span>{isChecking ? "Проверка..." : "Проверить"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(i)}
                  className={btn}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Изменить</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(i.code)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Panel
        className="mt-6"
        title="Журнал проверок"
        subtitle="История успешных и неуспешных проверок подключения"
        actions={
          <div className="flex gap-2">
            {(
              [
                ["", "Все"],
                ["успешно", "Успешные"],
                ["ошибка", "Ошибки"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={l}
                onClick={() => setF(k)}
                className={
                  f === k
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                    : btn
                }
              >
                {l} <span className="opacity-70">{logs.filter((x) => !k || x[1] === k).length}</span>
              </button>
            ))}
          </div>
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              {["Когда", "Интеграция", "Операция", "Результат", "Сообщение"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((l, idx) => (
              <tr key={`${l[0]}-${idx}`} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{l[0]}</td>
                <td className="px-4 py-3 font-medium">{l[3]}</td>
                <td className="px-4 py-3 text-muted-foreground">Проверка связи</td>
                <td className="px-4 py-3">
                  <Pill tone={l[1] === "успешно" ? "success" : "danger"}>{l[1]}</Pill>
                </td>
                <td className="px-4 py-3 text-xs leading-relaxed">{l[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Connection Configuration Dialog */}
      <IntegrationConfigDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </>
  );
}
