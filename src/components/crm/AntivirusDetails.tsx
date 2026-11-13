import type { Antivirus } from "@/lib/antivirus";
import { Pill } from "@/components/crm/Shell";

export function AntivirusStatus({ status }: { status: string }) {
  const tone =
    status === "активен"
      ? "success"
      : ["выключен", "неактивен", "ошибка"].includes(status.toLowerCase())
        ? "danger"
        : "neutral";
  return <Pill tone={tone}>{status || "нет данных"}</Pill>;
}

export function antivirusRows(av: Antivirus, provenance = false): [string, React.ReactNode][] {
  if (provenance)
    return [
      ["Антивирус (название)", av.name || "нет данных"],
      ["Источник названия", av.nameSource || av.source || "нет данных"],
      ["Название обновлено", av.nameUpdatedAt || "нет данных"],
      ["Антивирус (версия)", av.version || "нет данных"],
      ["Источник версии", av.versionSource || av.source || "нет данных"],
      ["Версия обновлена", av.versionUpdatedAt || "нет данных"],
      ["Антивирус (статус)", <AntivirusStatus status={av.status} />],
      ["Антивирус (источник)", av.source || "нет данных"],
    ];
  return [
    ["Антивирус (название)", av.name || "нет данных"],
    ["Антивирус (версия)", av.version || "нет данных"],
    ["Антивирус (статус)", <AntivirusStatus status={av.status} />],
    ["Антивирус (источник)", av.source || "нет данных"],
  ];
}
