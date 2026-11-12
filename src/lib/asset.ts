import raw from "@/data/assets.json";

export type Source = "TNI" | "KSC" | "AD" | "Mesh";
export const SOURCES: Source[] = ["TNI", "KSC", "AD", "Mesh"];

/** Asset as delivered by POST /api/v2/inventory-hub/sync/ (see docs/API_CONTRACT_CRM.md). */
export interface Asset {
  id: number;
  short_name: string;
  ip_address: string | null;
  inventory_no: string | null;
  serial_number: string | null;
  os_name: string | null;
  architecture: string | null;
  disk_model: string | null;
  disk_type: string | null;
  ram_gb: number | null;
  mem_type: string | null;
  mb_manuf: string | null;
  mb_model: string | null;
  cpu: string | null;
  cpu_manufacturer: string | null;
  cpu_model: string | null;
  cpu_cores: number | null;
  monitors: string | null;
  printers: string | null;
  current_user: string | null;
  mac_address: string | null;
  observed_at: string;
  source: Source;
  check_flag: string;
}

export const ASSETS = raw as Asset[];

/** KSC: nagent/visible gap above this many minutes means the agent is overdue. */
export const NAGENT_THRESHOLD_MIN = 10;

export interface ParsedFlags {
  ok: boolean;
  nagentOverdueMin: number | null;
  nameMatch: { tniName: string; tniIp: string } | null;
  other: string[];
}

export function parseCheckFlag(flag: string | null | undefined): ParsedFlags {
  const res: ParsedFlags = { ok: true, nagentOverdueMin: null, nameMatch: null, other: [] };
  if (!flag || flag.trim() === "ok") return res;
  res.ok = false;
  for (const part of flag.split(/;\s+(?![^()]*\))/)) {
    const p = part.trim();
    if (!p) continue;
    const ng = p.match(/nagent\/visible расходятся\s+(\d+)\s*мин/);
    if (ng) {
      const m = Number(ng[1]);
      if (m > NAGENT_THRESHOLD_MIN) res.nagentOverdueMin = m;
      continue;
    }
    const nm = p.match(/имя совпадает с TNI \(([^,]+),\s*IP\s+([^)]+)\)/);
    if (nm) {
      res.nameMatch = { tniName: nm[1]!.trim(), tniIp: nm[2]!.trim() };
      continue;
    }
    res.other.push(p);
  }
  return res;
}

export function splitList(v: string | null): string[] {
  return v ? v.split(/;\s*/).map((s) => s.trim()).filter(Boolean) : [];
}

export function formatMinutes(min: number): string {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  return d > 0 ? `${d} дн ${h} ч` : `${h} ч ${min % 60} мин`;
}

/** All records describing the same device name across sources. */
export function relatedBySource(a: Asset, all: Asset[] = ASSETS): Record<Source, Asset[]> {
  const key = a.short_name.toLowerCase();
  const out = { TNI: [], KSC: [], AD: [], Mesh: [] } as Record<Source, Asset[]>;
  for (const x of all) if (x.short_name.toLowerCase() === key) out[x.source]?.push(x);
  return out;
}
