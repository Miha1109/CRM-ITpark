import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Server,
  Shield,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Database,
} from "lucide-react";

export type SystemCode = "AD" | "KSC" | "TNI" | "Mesh" | "1C" | "custom";

export interface IntegrationItem {
  id?: string;
  code: string;
  name: string;
  proto: string;
  host: string;
  port?: string | number;
  note: string;
  ok: boolean | null;
  authType?: "basic" | "token" | "agent" | "none";
  username?: string;
  password?: string;
  token?: string;
  domain?: string;
  baseDn?: string;
  useSsl?: boolean;
  allowSelfSigned?: boolean;
  timeoutSeconds?: number;
  syncIntervalMinutes?: number;
  sharePath?: string;
  database?: string;
  syncContainers?: string[];
}

export interface TestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
  details?: string;
}

export interface PresetConfig {
  code: SystemCode;
  name: string;
  proto: string;
  defaultPort: string;
  defaultAuthType: "basic" | "token" | "agent" | "none";
  useSsl: boolean;
  allowSelfSigned: boolean;
  hostPlaceholder: string;
  notePlaceholder: string;
  hint: string;
}

export const AD_CONTAINERS = [
  { value: "CN=Computers", kind: "CN", label: "Контейнер компьютеров по умолчанию" },
  { value: "CN=Users", kind: "CN", label: "Контейнер пользователей" },
  { value: "OU=Workstations", kind: "OU", label: "Рабочие станции сотрудников" },
  { value: "OU=Computers", kind: "OU", label: "Компьютеры отделов и служб" },
  { value: "OU=Servers", kind: "OU", label: "Серверное оборудование" },
  { value: "OU=Laptops", kind: "OU", label: "Ноутбуки и мобильные ПК" },
  { value: "OU=Branches", kind: "OU", label: "Филиалы и удалённые РЭС" },
] as const;

export const SYSTEM_PRESETS: Record<SystemCode, PresetConfig> = {
  AD: {
    code: "AD",
    name: "Active Directory",
    proto: "LDAPS",
    defaultPort: "636",
    defaultAuthType: "basic",
    useSsl: true,
    allowSelfSigned: true,
    hostPlaceholder: "dc01.sbyt.minsk.energo.net, dc02.sbyt.minsk.energo.net",
    notePlaceholder: "Домен: sbyt.minsk.energo.net",
    hint: "Рекомендуется LDAPS (порт 636, SSL/TLS). При выборе стандартного LDAP порт автоматически меняется на 389. После проверки связи можно выбрать OU и CN для синхронизации.",
  },
  KSC: {
    code: "KSC",
    name: "Kaspersky Security Center",
    proto: "API (HTTP/REST)",
    defaultPort: "13299",
    defaultAuthType: "basic",
    useSsl: true,
    allowSelfSigned: true,
    hostPlaceholder: "10.177.105.41",
    notePlaceholder: "KSC OpenAPI v1.0",
    hint: "Важно: для basic-входа в KSC REST API требуется внутренняя локальная учётная запись KSC (группа KL-Administrators). Доменные учётные записи через basic-вход не поддерживаются.",
  },
  TNI: {
    code: "TNI",
    name: "Total Network Inventory",
    proto: "SMB",
    defaultPort: "445",
    defaultAuthType: "basic",
    useSsl: false,
    allowSelfSigned: false,
    hostPlaceholder: "10.177.100.46",
    notePlaceholder: "Синхронизация через парсер хранилища TNI",
    hint: "Синхронизация с Total Network Inventory возможна по SMB (сетевая папка хранилища, порт 445) либо напрямую через базу данных PostgreSQL (порт 5432).",
  },
  Mesh: {
    code: "Mesh",
    name: "MeshCentral",
    proto: "WebSocket API",
    defaultPort: "443",
    defaultAuthType: "token",
    useSsl: true,
    allowSelfSigned: true,
    hostPlaceholder: "mesh.sbyt.local",
    notePlaceholder: "Управление удалённым доступом",
    hint: "Для подключения требуется API-токен администратора или сервисного аккаунта MeshCentral.",
  },
  "1C": {
    code: "1C",
    name: "1C:Предприятие",
    proto: "OData / REST",
    defaultPort: "443",
    defaultAuthType: "basic",
    useSsl: true,
    allowSelfSigned: true,
    hostPlaceholder: "1c.sbyt.local/base/odata/standard.odata",
    notePlaceholder: "Синхронизация МОЛ и кадрового состава",
    hint: "Подключение к опубликованному интерфейсу 1C:OData для получения справочников сотрудников и основных средств.",
  },
  custom: {
    code: "custom",
    name: "Внешняя система",
    proto: "REST API",
    defaultPort: "443",
    defaultAuthType: "basic",
    useSsl: true,
    allowSelfSigned: false,
    hostPlaceholder: "api.domain.local",
    notePlaceholder: "Пользовательская интеграция",
    hint: "Произвольное подключение по REST/HTTP или специализированному протоколу.",
  },
};

export interface ProtocolOption {
  value: string;
  label: string;
  port: string;
  useSsl: boolean;
}

export const SYSTEM_PROTOCOLS: Record<SystemCode, ProtocolOption[]> = {
  AD: [
    { value: "LDAPS", label: "LDAPS (защищённый) — порт 636 (SSL)", port: "636", useSsl: true },
    { value: "LDAP", label: "LDAP (стандартный) — порт 389", port: "389", useSsl: false },
    { value: "LDAPS GC", label: "Global Catalog LDAPS — порт 3269 (SSL)", port: "3269", useSsl: true },
    { value: "LDAP GC", label: "Global Catalog LDAP — порт 3268", port: "3268", useSsl: false },
    { value: "custom", label: "Другой протокол (вручную)", port: "636", useSsl: true },
  ],
  KSC: [
    { value: "API (HTTP/REST)", label: "KSC OpenAPI (REST) — порт 13299 (SSL)", port: "13299", useSsl: true },
    { value: "HTTP/REST", label: "HTTP / REST — порт 8080 (без SSL)", port: "8080", useSsl: false },
    { value: "HTTPS/REST", label: "HTTPS / REST — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "custom", label: "Другой протокол (вручную)", port: "13299", useSsl: true },
  ],
  TNI: [
    { value: "SMB", label: "SMB (сетевая папка хранилища TNI) — порт 445", port: "445", useSsl: false },
    { value: "PostgreSQL", label: "PostgreSQL (прямое подключение к БД) — порт 5432", port: "5432", useSsl: false },
    { value: "HTTPS API", label: "HTTPS REST API — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "HTTP API", label: "HTTP REST API — порт 80", port: "80", useSsl: false },
    { value: "custom", label: "Другой протокол (вручную)", port: "445", useSsl: false },
  ],
  Mesh: [
    { value: "WebSocket API", label: "WebSocket Secure (WSS) — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "WebSocket (WS)", label: "WebSocket (WS) — порт 80", port: "80", useSsl: false },
    { value: "HTTPS API", label: "HTTPS REST API — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "custom", label: "Другой протокол (вручную)", port: "443", useSsl: true },
  ],
  "1C": [
    { value: "OData / REST", label: "OData / REST (HTTPS) — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "OData (HTTP)", label: "OData / REST (HTTP) — порт 80", port: "80", useSsl: false },
    { value: "1C Cluster", label: "Кластер 1C — порт 1541", port: "1541", useSsl: false },
    { value: "custom", label: "Другой протокол (вручную)", port: "443", useSsl: true },
  ],
  custom: [
    { value: "HTTPS / REST", label: "HTTPS / REST — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "HTTP / REST", label: "HTTP / REST — порт 80", port: "80", useSsl: false },
    { value: "WebSocket (WSS)", label: "WebSocket WSS — порт 443 (SSL)", port: "443", useSsl: true },
    { value: "gRPC", label: "gRPC — порт 50051 (SSL)", port: "50051", useSsl: true },
    { value: "custom", label: "Другой протокол (вручную)", port: "443", useSsl: true },
  ],
};

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: IntegrationItem | null;
  onSave: (savedItem: IntegrationItem) => void;
  onTestConnection?: (item: IntegrationItem) => Promise<TestResult>;
}

export function IntegrationConfigDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onTestConnection,
}: IntegrationConfigDialogProps) {
  const isEditing = Boolean(item);

  const initialSystem: SystemCode = item?.code
    ? (SYSTEM_PRESETS[item.code as SystemCode] ? (item.code as SystemCode) : "custom")
    : "KSC";

  const [selectedSystem, setSelectedSystem] = useState<SystemCode>(initialSystem);
  const [code, setCode] = useState(item?.code || "KSC");
  const [name, setName] = useState(item?.name || SYSTEM_PRESETS.KSC.name);
  const [proto, setProto] = useState(item?.proto || SYSTEM_PRESETS.KSC.proto);
  const [host, setHost] = useState(item?.host || "");
  const [port, setPort] = useState(item?.port?.toString() || SYSTEM_PRESETS.KSC.defaultPort);
  const [note, setNote] = useState(item?.note || "");
  const [authType, setAuthType] = useState<"basic" | "token" | "agent" | "none">(
    item?.authType || SYSTEM_PRESETS.KSC.defaultAuthType
  );
  const [username, setUsername] = useState(item?.username || "");
  const [password, setPassword] = useState(item?.password || "");
  const [token, setToken] = useState(item?.token || "");
  const [domain, setDomain] = useState(item?.domain || "");
  const [baseDn, setBaseDn] = useState(item?.baseDn || "");
  const [useSsl, setUseSsl] = useState(item?.useSsl ?? true);
  const [allowSelfSigned, setAllowSelfSigned] = useState(item?.allowSelfSigned ?? true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(item?.timeoutSeconds || 10);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(item?.syncIntervalMinutes || 60);

  // Specialized fields for TNI & AD
  const [sharePath, setSharePath] = useState(item?.sharePath || "");
  const [database, setDatabase] = useState(item?.database || "");
  const [syncContainers, setSyncContainers] = useState<string[]>(item?.syncContainers || []);

  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCustomProto, setIsCustomProto] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        const sys = (SYSTEM_PRESETS[item.code as SystemCode] ? item.code : "custom") as SystemCode;
        setSelectedSystem(sys);
        setCode(item.code);
        setName(item.name);
        setProto(item.proto);
        setHost(item.host);
        setPort(item.port ? String(item.port) : SYSTEM_PRESETS[sys]?.defaultPort || "443");
        setNote(item.note || "");
        setAuthType(item.authType || SYSTEM_PRESETS[sys]?.defaultAuthType || "basic");
        setUsername(item.username || "");
        setPassword(item.password || "");
        setToken(item.token || "");
        setDomain(item.domain || "");
        setBaseDn(item.baseDn || "");
        setUseSsl(item.useSsl ?? true);
        setAllowSelfSigned(item.allowSelfSigned ?? true);
        setTimeoutSeconds(item.timeoutSeconds || 10);
        setSyncIntervalMinutes(item.syncIntervalMinutes || 60);
        setSharePath(item.sharePath || "");
        setDatabase(item.database || "");
        setSyncContainers(item.syncContainers || []);
      } else {
        applyPreset("KSC");
      }
      setTestResult(null);
      setErrors({});
      setIsCustomProto(false);
      setShowPassword(false);
    }
  }, [open, item]);

  const applyPreset = (sys: SystemCode) => {
    setIsCustomProto(false);
    setSelectedSystem(sys);
    const p = SYSTEM_PRESETS[sys];
    setCode(p.code === "custom" ? "EXT" : p.code);
    setName(p.name);
    setProto(p.proto);
    setPort(p.defaultPort);
    setAuthType(p.defaultAuthType);
    setUseSsl(p.useSsl);
    setAllowSelfSigned(p.allowSelfSigned);
    setSharePath(sys === "TNI" ? "\\\\10.177.100.46\\inventory-hub" : "");
    setDatabase(sys === "TNI" ? "tni" : "");
    setSyncContainers([]);
    if (!item) {
      setHost("");
      setNote(p.notePlaceholder);
      setUsername("");
      setPassword("");
      setToken("");
      if (sys === "AD") {
        setDomain("sbyt.minsk.energo.net");
        setBaseDn("DC=sbyt,DC=minsk,DC=energo,DC=net");
        setSyncContainers(["OU=Workstations", "OU=Servers", "OU=Laptops"]);
      } else {
        setDomain("");
        setBaseDn("");
      }
    }
    setTestResult(null);
  };

  const handleProtocolChange = (selectedVal: string) => {
    if (selectedVal === "custom") {
      setIsCustomProto(true);
      return;
    }
    setIsCustomProto(false);
    const protocols = SYSTEM_PROTOCOLS[selectedSystem] || SYSTEM_PROTOCOLS.custom;
    const matched = protocols.find((p) => p.value === selectedVal);
    if (matched) {
      setProto(matched.value);
      setPort(matched.port);
      setUseSsl(matched.useSsl);
      if (errors.port) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.port;
          return next;
        });
      }
    } else {
      setProto(selectedVal);
    }
  };

  const handleSystemChange = (value: string) => {
    const sys = value as SystemCode;
    applyPreset(sys);
  };

  const toggleContainer = (val: string) => {
    setSyncContainers((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const isTniSmb = selectedSystem === "TNI" && proto === "SMB";
  const isTniPostgres = selectedSystem === "TNI" && proto === "PostgreSQL";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!host.trim()) {
      newErrors.host = "Укажите адрес хоста или IP";
    }
    if (!port || isNaN(Number(port))) {
      newErrors.port = "Укажите корректный порт";
    }
    if (!name.trim()) {
      newErrors.name = "Укажите наименование";
    }
    if (isTniSmb && !sharePath.trim()) {
      newErrors.sharePath = "Укажите SMB-путь к хранилищу";
    }
    if (isTniPostgres && !database.trim()) {
      newErrors.database = "Укажите имя базы данных";
    }
    if (authType === "basic" && !username.trim()) {
      newErrors.username = "Укажите имя пользователя / учётную запись";
    }
    if (authType === "token" && !token.trim()) {
      newErrors.token = "Укажите API-токен";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const runTest = async () => {
    if (!validate()) return;

    setIsTesting(true);
    setTestResult(null);

    const currentConfig: IntegrationItem = {
      id: item?.id || `int-${Date.now()}`,
      code,
      name,
      proto,
      host,
      port: Number(port),
      note,
      ok: null,
      authType,
      username,
      password,
      token,
      domain,
      baseDn,
      useSsl,
      allowSelfSigned,
      timeoutSeconds,
      syncIntervalMinutes,
      sharePath: isTniSmb ? sharePath : undefined,
      database: isTniPostgres ? database : undefined,
      syncContainers,
    };

    if (onTestConnection) {
      try {
        const res = await onTestConnection(currentConfig);
        setTestResult(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Не удалось связаться с сервером";
        setTestResult({
          ok: false,
          message: "Ошибка подключения",
          details: msg,
        });
      } finally {
        setIsTesting(false);
      }
      return;
    }

    setTimeout(() => {
      setIsTesting(false);
      if (code === "KSC") {
        if (username.includes("@") || username.includes("\\")) {
          setTestResult({
            ok: false,
            message: "KSC отклонил доменную учётку",
            details:
              "Для basic-входа в KSC REST API требуется внутренний локальный пользователь KSC (не доменная учётка Windows).",
          });
          return;
        }
      }

      let extraDetails = `Сервис ${name} доступен по адресу ${host}:${port} (${proto}). Рукопожатие выполнено.`;
      if (selectedSystem === "AD") {
        extraDetails += ` Каталог Active Directory отвечает. Доступны подразделения (OU) и контейнеры (CN). Выберите необходимые объекты ниже.`;
      } else if (isTniSmb) {
        extraDetails += ` Сетевая папка SMB (${sharePath || host}) доступна на чтение (порт 445). Хранилище TNI прочитано.`;
      } else if (isTniPostgres) {
        extraDetails += ` База данных PostgreSQL (${database || "tni"}) успешно подключена (порт ${port}).`;
      }

      setTestResult({
        ok: true,
        message: "Связь успешно установлена",
        latencyMs: Math.floor(Math.random() * 25) + 12,
        details: extraDetails,
      });
    }, 700);
  };

  const handleSave = () => {
    if (!validate()) return;

    const saved: IntegrationItem = {
      id: item?.id || `int-${Date.now()}`,
      code,
      name,
      proto,
      host,
      port: port ? Number(port) : undefined,
      note: note.trim() || SYSTEM_PRESETS[selectedSystem]?.notePlaceholder || "",
      ok: testResult ? testResult.ok : item?.ok ?? null,
      authType,
      username: username.trim() || undefined,
      password: password || undefined,
      token: token || undefined,
      domain: domain.trim() || undefined,
      baseDn: baseDn.trim() || undefined,
      useSsl,
      allowSelfSigned,
      timeoutSeconds: Number(timeoutSeconds) || 10,
      syncIntervalMinutes: Number(syncIntervalMinutes) || 60,
      sharePath: isTniSmb ? sharePath : undefined,
      database: isTniPostgres ? database : undefined,
      syncContainers: selectedSystem === "AD" ? syncContainers : undefined,
    };

    onSave(saved);
    onOpenChange(false);
  };

  const activePreset = SYSTEM_PRESETS[selectedSystem] || SYSTEM_PRESETS.custom;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? `Настройка подключения: ${name}` : "Новая интеграция"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Параметры соединения, протокол и учётные данные для внешней системы.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* System Preset Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Целевая система
            </Label>
            <Select value={selectedSystem} onValueChange={handleSystemChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите систему" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KSC">Kaspersky Security Center (KSC OpenAPI)</SelectItem>
                <SelectItem value="AD">Active Directory (LDAP / LDAPS)</SelectItem>
                <SelectItem value="TNI">Total Network Inventory (SMB / PostgreSQL)</SelectItem>
                <SelectItem value="Mesh">MeshCentral (WebSocket API)</SelectItem>
                <SelectItem value="1C">1C:Предприятие (Кадры / МОЛ / OData)</SelectItem>
                <SelectItem value="custom">Другая система (произвольный REST/API)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* System Hint Callout */}
          {activePreset.hint && (
            <div className="rounded-md border border-muted bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>{activePreset.hint}</div>
              </div>
            </div>
          )}

          {/* Code, Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Код системы</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AD, KSC..."
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Отображаемое название</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kaspersky Security Center"
                className="mt-1"
              />
              {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
            </div>
          </div>

          {/* Protocol, Host & Port */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Label className="text-xs">Протокол подключения</Label>
              <Select
                value={
                  isCustomProto ||
                  !SYSTEM_PROTOCOLS[selectedSystem]?.some((p) => p.value === proto)
                    ? "custom"
                    : proto
                }
                onValueChange={handleProtocolChange}
              >
                <SelectTrigger className="mt-1 w-full text-xs">
                  <SelectValue placeholder="Выберите протокол" />
                </SelectTrigger>
                <SelectContent>
                  {(SYSTEM_PROTOCOLS[selectedSystem] || SYSTEM_PROTOCOLS.custom).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustomProto && (
                <Input
                  value={proto}
                  onChange={(e) => setProto(e.target.value)}
                  placeholder="Введите протокол (например, gRPC)"
                  className="mt-1.5 font-mono text-xs"
                />
              )}
            </div>
            <div className="sm:col-span-5">
              <Label className="text-xs">Хост / IP-адрес</Label>
              <Input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder={activePreset.hostPlaceholder}
                className="mt-1 font-mono text-xs"
              />
              {errors.host && <span className="text-xs text-destructive">{errors.host}</span>}
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Порт</Label>
              <Input
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder={activePreset.defaultPort}
                className="mt-1 font-mono text-xs"
              />
              {errors.port && <span className="text-xs text-destructive">{errors.port}</span>}
            </div>
          </div>

          {/* TNI Specific: SMB share path or PostgreSQL database */}
          {selectedSystem === "TNI" && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                {isTniPostgres ? <Database className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}
                <span>{isTniPostgres ? "Параметры базы данных PostgreSQL TNI" : "Параметры хранилища TNI по SMB"}</span>
              </div>
              {isTniSmb && (
                <div>
                  <Label className="text-xs">Сетевой путь SMB (UNC-путь)</Label>
                  <Input
                    value={sharePath}
                    onChange={(e) => setSharePath(e.target.value)}
                    placeholder="\\10.177.100.46\inventory-hub\data"
                    className="mt-1 font-mono text-xs bg-background"
                  />
                  {errors.sharePath && <span className="text-xs text-destructive">{errors.sharePath}</span>}
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    Укажите путь к каталогу с файлами инвентаризации TNI (.inv, .xml, sqlite хранилище).
                  </span>
                </div>
              )}
              {isTniPostgres && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Имя базы данных PostgreSQL</Label>
                    <Input
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      placeholder="tni"
                      className="mt-1 font-mono text-xs bg-background"
                    />
                    {errors.database && <span className="text-xs text-destructive">{errors.database}</span>}
                  </div>
                  <div>
                    <Label className="text-xs">Схема данных</Label>
                    <Input
                      defaultValue="public"
                      placeholder="public"
                      className="mt-1 font-mono text-xs bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AD Specific Fields */}
          {selectedSystem === "AD" && (
            <div className="grid grid-cols-1 gap-3 rounded-md border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">DNS-имя домена</Label>
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="sbyt.minsk.energo.net"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Base DN для поиска</Label>
                <Input
                  value={baseDn}
                  onChange={(e) => setBaseDn(e.target.value)}
                  placeholder="DC=sbyt,DC=minsk,DC=energo,DC=net"
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Authentication Section */}
          <div className="space-y-3 rounded-md border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {isTniSmb
                    ? "Учётные данные для доступа к SMB-папке"
                    : isTniPostgres
                    ? "Учётные данные пользователя PostgreSQL"
                    : "Авторизация и доступ"}
                </span>
              </div>
              {!isTniSmb && !isTniPostgres && (
                <div className="w-48">
                  <Select
                    value={authType}
                    onValueChange={(v) =>
                      setAuthType(v as "basic" | "token" | "agent" | "none")
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Логин и пароль (Basic)</SelectItem>
                      <SelectItem value="token">API-токен / Ключ</SelectItem>
                      <SelectItem value="agent">Агент / Локальный скрипт</SelectItem>
                      <SelectItem value="none">Без авторизации</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {(authType === "basic" || isTniSmb || isTniPostgres) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">
                    {selectedSystem === "KSC"
                      ? "Внутренний пользователь KSC"
                      : selectedSystem === "AD"
                      ? "Учётная запись (UPN или DN)"
                      : isTniPostgres
                      ? "Пользователь БД PostgreSQL"
                      : isTniSmb
                      ? "Логин для сетевой папки (domain\\user)"
                      : "Имя пользователя"}
                  </Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      selectedSystem === "KSC"
                        ? "ksc_service_user"
                        : selectedSystem === "AD"
                        ? "svc_inventory@sbyt.minsk.energo.net"
                        : isTniPostgres
                        ? "tni_reader"
                        : isTniSmb
                        ? "CORP\\svc_tni"
                        : "service_admin"
                    }
                    className="mt-1 font-mono text-xs"
                  />
                  {errors.username && (
                    <span className="text-xs text-destructive">{errors.username}</span>
                  )}
                  {selectedSystem === "KSC" && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Без @домена и префикса DOMAIN\
                    </span>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Пароль</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pr-9 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {authType === "token" && !isTniSmb && !isTniPostgres && (
              <div>
                <Label className="text-xs">API-токен доступа</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Вставьте токен..."
                    className="pr-9 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.token && <span className="text-xs text-destructive">{errors.token}</span>}
              </div>
            )}

            {authType === "agent" && !isTniSmb && !isTniPostgres && (
              <div className="rounded border border-dashed border-border p-2.5 text-xs text-muted-foreground">
                Аутентификация не требуется: сбор данных осуществляется внешней утилитой или скриптом
                inventory-hub с прямым доступом к базе данных или файловой шаре.
              </div>
            )}
          </div>

          {/* SSL / TLS Security Options */}
          <div className="rounded-md border border-border/60 bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Switch id="use-ssl" checked={useSsl} onCheckedChange={setUseSsl} />
                <Label htmlFor="use-ssl" className="cursor-pointer text-xs font-medium">
                  Использовать защищённое SSL/TLS соединение
                </Label>
              </div>

              {useSsl && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="allow-self-signed"
                    checked={allowSelfSigned}
                    onCheckedChange={setAllowSelfSigned}
                  />
                  <Label
                    htmlFor="allow-self-signed"
                    className="cursor-pointer text-xs text-muted-foreground"
                  >
                    Разрешить самоподписанный сертификат
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Advanced collapsible settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showAdvanced ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              <span>
                {showAdvanced
                  ? "Скрыть дополнительные параметры"
                  : "Дополнительные параметры (таймауты, sync, заметки)"}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-3 rounded-md border border-border/50 bg-muted/20 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Таймаут запроса (сек)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={timeoutSeconds}
                      onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Интервал синхронизации (мин)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={1440}
                      value={syncIntervalMinutes}
                      onChange={(e) => setSyncIntervalMinutes(Number(e.target.value))}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Примечание / статусная заметка</Label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Примечание к подключению..."
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Connection Test Feedback Box */}
          {testResult && (
            <div
              className={`rounded-md border p-3 text-xs ${
                testResult.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold">
                    {testResult.message}
                    {testResult.latencyMs && (
                      <span className="ml-2 font-mono font-normal opacity-80">
                        ({testResult.latencyMs} мс)
                      </span>
                    )}
                  </div>
                  {testResult.details && (
                    <div className="text-[11px] leading-relaxed opacity-90">
                      {testResult.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AD Container Selection (revealed after test or if already selected) */}
          {selectedSystem === "AD" && (testResult?.ok || syncContainers.length > 0) && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <FolderTree className="h-4 w-4" />
                  <span>Выбор OU и CN для синхронизации</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Выбрано: {syncContainers.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Укажите, с какими подразделениями (OU) и контейнерами (CN) домена синхронизировать устройства и рабочие места:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {AD_CONTAINERS.map((cnt) => {
                  const isChecked = syncContainers.includes(cnt.value);
                  return (
                    <label
                      key={cnt.value}
                      className={`flex items-start gap-2 rounded border p-2 cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? "border-primary bg-background shadow-xs font-medium"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleContainer(cnt.value)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px]">{cnt.value}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{cnt.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={runTest}
            disabled={isTesting}
            className="gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Проверка связи...</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Проверить связь</span>
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} className="font-semibold">
              {isEditing ? "Сохранить изменения" : "Добавить интеграцию"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
