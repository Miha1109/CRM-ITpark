import raw from "@/data/inventory.json";
import {
  antivirusOf,
  otherAntivirusPrograms,
  type Antivirus,
  type AntivirusInput,
} from "@/lib/antivirus";

export type RawRow = AntivirusInput & {
  id: number;
  ip: string;
  name: string;
  inv: string;
  os: string;
  arch: string;
  disk: string;
  diskType: string;
  ram: string;
  memType: string;
  mbManuf: string;
  mbModel: string;
  cpu: string;
  cores: string;
  monitors: string;
  printers: string;
  user: string;
  mac: string;
  serial: string;
  source: string;
  observed: string;
  flag: string;
  ksc_agent_installed?: boolean;
};
export type AssetStatus = "active" | "repair" | "decommissioned";
export type SyncState = "synced" | "pending" | "conflict";
export type Discrepancy = {
  kind: "nagent" | "ip" | "name" | "anchor" | "new" | "other";
  text: string;
};

export type Asset = RawRow & {
  antivirus: Antivirus;
  otherAntiviruses: Antivirus[];
  status: AssetStatus;
  dept: string;
  sync: SyncState;
  discrepancies: Discrepancy[];
  mol: string;
  molPosition: string;
  owner: string;
  employeeStatus: "работает" | "уволен";
  ksc: {
    agent: "активен" | "не отвечает" | "нет агента";
    nagentAt: string;
    visibleAt: string;
    avBases: string;
    avStatus: "актуальны" | "устарели";
    policy: string;
    group: string;
    version: string;
  };
  ad: { dn: string; ou: string; groups: string[]; enabled: boolean; lastLogon: string };
  mesh: { online: boolean; lastSeen: string; nodeId: string; rdp: boolean; agentVer: string };
  software: { name: string; version: string; vendor: string }[];
  audit: { at: string; who: string; field: string; from: string; to: string; source: string }[];
};

const DEPTS: Record<string, string> = {
  mose: "Минские ОЭС",
  osemr: "ОСЭМР",
  askue: "АСКУЭ",
  bormro: "Борисовский МРО",
  moste: "МОСТЭ",
  orfl: "ОРФЛ",
  ceh: "Цех",
  puhmro: "Пуховичский МРО",
  molodechno: "Молодечно",
  sl: "Служба линий",
  vileikamro: "Вилейский МРО",
  asu: "АСУ",
  solmro: "Солигорский МРО",
  smol: "Смолевичи",
  kletskmro: "Клецкий МРО",
  zhodino: "Жодино",
  logojsk: "Логойск",
  orimr: "ОРИМР",
  buh: "Бухгалтерия",
  sdtu: "СДТУ",
  orik: "ОРИК",
  stolbmro: "Столбцовский МРО",
  aup: "АУП",
  oerzis: "ОЭРЗиС",
  pto: "ПТО",
};
export const deptOf = (name: string) =>
  DEPTS[name.toLowerCase().split(/[-_0-9]/)[0] ?? ""] ?? "Прочие";

function rng(seed: number) {
  let s = (seed * 2654435761) % 4294967296;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const pick = <T>(r: () => number, a: T[]): T => {
  const value = a[Math.floor(r() * a.length)];
  if (value === undefined) throw new Error("Cannot pick from an empty list");
  return value;
};
const SURN = [
  "Тальков И.П.",
  "Ковальчук А.С.",
  "Мельник О.В.",
  "Жук Д.Н.",
  "Новик Е.А.",
  "Шевчук В.М.",
  "Кравченко Н.И.",
  "Лукашевич С.Г.",
  "Бондарь Т.Ю.",
  "Савицкий П.Л.",
];
const POS = [
  "Инженер",
  "Ведущий инженер",
  "Бухгалтер",
  "Начальник отдела",
  "Мастер участка",
  "Экономист",
  "Программист",
];
const SW: [string, string, string][] = [
  ["Microsoft Office 2019", "16.0.10827", "Microsoft"],
  ["Google Chrome", "130.0.6723", "Google"],
  ["Kaspersky Endpoint Security", "12.6.0.438", "АО Лаборатория Касперского"],
  ["1С:Предприятие 8.3", "8.3.24.1548", "1С"],
  ["7-Zip", "24.08", "Igor Pavlov"],
  ["Adobe Acrobat Reader", "24.004", "Adobe"],
  ["MeshAgent", "1.1.29", "MeshCentral"],
  ["Mozilla Firefox ESR", "128.4.0", "Mozilla"],
  ["AnyDesk", "8.1.0", "AnyDesk"],
  ["Notepad++", "8.7", "Don Ho"],
];
function shift(observed: string, mins: number) {
  const d = new Date((observed || "2026-11-09 08:00").replace(" ", "T") + ":00Z");
  d.setUTCMinutes(d.getUTCMinutes() - mins);
  return d.toISOString().slice(0, 16).replace("T", " ") as string;
}

function classify(flag: string): Discrepancy[] {
  if (!flag || flag === "ok") return [];
  return flag
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => {
      const l = text.toLowerCase();
      const kind: Discrepancy["kind"] = l.includes("nagent")
        ? "nagent"
        : l.includes("ip")
          ? "ip"
          : l.includes("имя")
            ? "name"
            : l.includes("якор")
              ? "anchor"
              : l.includes("новый") || l.includes("нет в tni")
                ? "new"
                : "other";
      return { kind, text };
    });
}

function enrich(row: RawRow): Asset {
  const r = rng(row.id);
  const disc = classify(row.flag);
  const x = r();
  if (x < 0.04 && row.ip)
    disc.push({
      kind: "ip",
      text: `IP в TNI (${row.ip}) не совпадает с KSC (10.177.${100 + Math.floor(r() * 9)}.${Math.floor(r() * 250)})`,
    });
  else if (x < 0.07)
    disc.push({
      kind: "name",
      text: `Имя в AD (${row.name.toUpperCase()}-OLD) не совпадает с TNI (${row.name})`,
    });
  const status: AssetStatus = r() < 0.06 ? "repair" : r() < 0.08 ? "decommissioned" : "active";
  const nagentLag = disc.find((d) => d.kind === "nagent") ? 27301 : Math.floor(r() * 8);
  const login = row.user.split("\\")[1] ?? "";
  const mol = pick(r, SURN);
  const dept = deptOf(row.name);
  const online = status === "active" && r() < 0.68;
  const sync: SyncState = disc.some((d) => d.kind !== "other")
    ? "conflict"
    : r() < 0.1
      ? "pending"
      : "synced";
  const sw = SW.filter(() => r() < 0.7).map(([name, version, vendor]) => ({
    name,
    version,
    vendor,
  }));
  const ou = `OU=${dept.replace(/\s/g, "_")},OU=Computers,DC=sbyt,DC=minsk,DC=energo,DC=net`;
  return {
    ...row,
    antivirus: antivirusOf(row),
    otherAntiviruses: otherAntivirusPrograms(row, antivirusOf(row)),
    status,
    dept,
    sync,
    discrepancies: disc,
    mol,
    molPosition: pick(r, POS),
    owner: "РУП «Минскэнерго» — Энергосбыт",
    employeeStatus: r() < 0.05 ? "уволен" : "работает",
    ksc: {
      agent: row.source === "AD" ? "нет агента" : nagentLag > 10 ? "не отвечает" : "активен",
      nagentAt: shift(row.observed, nagentLag) ?? "—",
      visibleAt: row.observed || "—",
      avBases: shift(row.observed, Math.floor(r() * 4000)),
      avStatus: r() < 0.12 ? "устарели" : "актуальны",
      policy: pick(r, ["KES — Рабочие станции", "KES — Бухгалтерия", "KES — Строгая"]),
      group: `Управляемые устройства/${dept}`,
      version: "12.6.0.438",
    },
    ad: {
      dn: `CN=${row.name.toUpperCase()},${ou}`,
      ou,
      groups: [
        "Domain Computers",
        `PC_${dept.replace(/\s/g, "_")}`,
        ...(r() < 0.3 ? ["GPO_USB_Block"] : []),
      ],
      enabled: status !== "decommissioned",
      lastLogon: shift(row.observed, Math.floor(r() * 3000)),
    },
    mesh: {
      online,
      lastSeen: online ? "сейчас" : shift(row.observed, Math.floor(r() * 9000)),
      nodeId: `node//${row.id.toString(16).padStart(6, "0")}${Math.floor(r() * 1e6).toString(16)}`,
      rdp: r() < 0.5,
      agentVer: "1.1.29",
    },
    software: sw,
    audit: [
      {
        at: row.observed || "2026-11-09 08:00",
        who: "inventory-hub",
        field: "observed_at",
        from: shift(row.observed, 1440),
        to: row.observed,
        source: row.source,
      },
      {
        at: shift(row.observed, 4320),
        who: "1С ЗУП",
        field: "mol",
        from: pick(r, SURN),
        to: mol,
        source: "1С",
      },
      {
        at: shift(row.observed, 10080),
        who: login || "admin",
        field: "ip_address",
        from: `10.177.10${Math.floor(r() * 9)}.${Math.floor(r() * 250)}`,
        to: row.ip || "—",
        source: "TNI",
      },
      {
        at: shift(row.observed, 43200),
        who: "inventory-hub",
        field: "created",
        from: "—",
        to: "актив создан",
        source: row.source,
      },
    ],
  };
}

export const ASSETS: Asset[] = (raw as RawRow[]).map(enrich);
export const getAsset = (id: number) => ASSETS.find((a) => a.id === id);
export const DEPARTMENTS = [...new Set(ASSETS.map((a) => a.dept))].sort();
export const STATUS_LABEL: Record<AssetStatus, string> = {
  active: "активен",
  repair: "ремонт",
  decommissioned: "списан",
};
export const SYNC_LABEL: Record<SyncState, string> = {
  synced: "синхронизирован",
  pending: "ожидает",
  conflict: "конфликт",
};
export const splitList = (s: string) =>
  s
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
