import type { Asset } from "@/lib/assets";
import { ANTIVIRUS_COLUMNS } from "@/lib/antivirus";

const COLUMNS: [string, keyof Asset][] = [
  ["№", "id"], ["IP-адрес", "ip"], ["Короткое имя ПК", "name"], ["Инвентарный №", "inv"],
  ["Операционная система", "os"], ["Архитектура", "arch"], ["Накопители", "disk"],
  ["Тип диска", "diskType"], ["ОЗУ", "ram"], ["Тип памяти", "memType"],
  ["Производитель материнской платы", "mbManuf"], ["Модель материнской платы", "mbModel"],
  ["ЦП", "cpu"], ["Ядер", "cores"], ["Мониторы", "monitors"], ["Принтеры (USB, локальные)", "printers"],
  ["Текущий пользователь", "user"], ["MAC-адрес (физ.)", "mac"], ["Серийный номер", "serial"],
  ["Источник", "source"], ["Дата наблюдения (observed_at)", "observed"], ["Проверка дублей/якорей", "flag"],
];

function cell(value: unknown): string {
  let s = String(value ?? "");
  // Prevent spreadsheet applications from executing imported text as formulas.
  if (/^[\s]*[=+@-]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export function inventoryCsv(rows: Asset[]): string {
  return "\uFEFF" + [
    [...COLUMNS.map(([label]) => label), ...ANTIVIRUS_COLUMNS],
    ...rows.map(a => [...COLUMNS.map(([, key]) => a[key]), a.antivirus.name, a.antivirus.version, a.antivirus.status, a.antivirus.source]),
  ].map(row => row.map(cell).join(",")).join("\r\n") + "\r\n";
}