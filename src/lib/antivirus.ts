export type Antivirus = {
  name: string;
  version: string;
  status: string;
  source: string;
  nameSource?: string;
  nameUpdatedAt?: string;
  versionSource?: string;
  versionUpdatedAt?: string;
};

export type AntivirusInput = {
  "Антивирус (название)"?: string;
  "Антивирус (версия)"?: string;
  "Антивирус (статус)"?: string;
  "Антивирус (источник)"?: string;
  ksc_antivirus?: string;
  ksc_av?: string | number;
  ksc_av_version?: string | number;
  ksc_av_status?: string | number;
  antivirusPrograms?: Antivirus[];
  antivirusNameSource?: string;
  antivirusNameUpdatedAt?: string;
  antivirusVersionSource?: string;
  antivirusVersionUpdatedAt?: string;
};

const text = (v: string | number | undefined) => (v === undefined ? "" : String(v).trim());

export function antivirusOf(row: AntivirusInput): Antivirus {
  const name = text(row["Антивирус (название)"]) || text(row.ksc_antivirus) || text(row.ksc_av);
  const version = text(row["Антивирус (версия)"]) || text(row.ksc_av_version);
  const status = text(row["Антивирус (статус)"]) || text(row.ksc_av_status);
  const fromKsc = [row.ksc_antivirus, row.ksc_av, row.ksc_av_version, row.ksc_av_status].some(
    (v) => text(v) !== "",
  );
  const av: Antivirus = {
    name,
    version,
    status,
    source: text(row["Антивирус (источник)"]) || (fromKsc ? "KSC" : ""),
  };
  if (row.antivirusNameSource !== undefined) av.nameSource = row.antivirusNameSource;
  if (row.antivirusNameUpdatedAt !== undefined) av.nameUpdatedAt = row.antivirusNameUpdatedAt;
  if (row.antivirusVersionSource !== undefined) av.versionSource = row.antivirusVersionSource;
  if (row.antivirusVersionUpdatedAt !== undefined)
    av.versionUpdatedAt = row.antivirusVersionUpdatedAt;
  return av;
}

export function otherAntivirusPrograms(row: AntivirusInput, av: Antivirus): Antivirus[] {
  const records = row.antivirusPrograms || [];
  const other = antivirusSections(av).other;
  return [
    ...(other ? [other] : []),
    ...records.filter((p) => p.source.trim().toUpperCase() !== "KSC"),
  ];
}

export function matchesAntivirusFilter(
  records: Antivirus[],
  name: string,
  status: string,
): boolean {
  const names = records.filter((r) => r.name.trim());
  if (name === "__unknown" && names.length > 0) return false;
  if (name && name !== "__unknown" && !names.some((r) => r.name === name)) return false;
  const candidates = name && name !== "__unknown" ? names.filter((r) => r.name === name) : records;
  if (status === "__unknown")
    return candidates.length === 0 || candidates.some((r) => !r.status.trim());
  return !status || candidates.some((r) => r.status === status);
}

export const ANTIVIRUS_COLUMNS = [
  "Антивирус (название)",
  "Антивирус (версия)",
  "Антивирус (статус)",
  "Антивирус (источник)",
] as const;

export function antivirusSections(av: Antivirus): {
  ksc: Antivirus | null;
  other: Antivirus | null;
} {
  if (![av.name, av.version, av.status, av.source].some((v) => v.trim()))
    return { ksc: null, other: null };
  return av.source.trim().toUpperCase() === "KSC"
    ? { ksc: av, other: null }
    : { ksc: null, other: av };
}
