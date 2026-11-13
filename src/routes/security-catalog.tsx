import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { PageHeader, Pill } from "@/components/crm/Shell";
import { LocalSecurityMatcher } from "@/components/crm/LocalSecurityMatcher";
import {
  CATALOG_VERSION,
  SECURITY_CATALOG,
  searchSecurityCatalog,
  type SecurityCategory,
} from "@/lib/security-catalog";

export const Route = createFileRoute("/security-catalog")({
  head: () => ({
    meta: [
      { title: "Справочник антивирусов и СЗИ — CRM IT-парк" },
      {
        name: "description",
        content:
          "Локальный справочник антивирусов и средств защиты информации с поиском по сигнатурам программ.",
      },
      { property: "og:title", content: "Справочник антивирусов и СЗИ — CRM IT-парк" },
      {
        property: "og:description",
        content: "Поиск и локальное сопоставление названий программ без интернет-запросов.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecurityCatalog,
});

function SecurityCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SecurityCategory | "">("");
  const products = searchSecurityCatalog(query, category);
  return (
    <>
      <PageHeader
        title="Справочник антивирусов и СЗИ"
        subtitle={`Локальный справочник · версия ${CATALOG_VERSION} · ${SECURITY_CATALOG.length} продуктов`}
        actions={
          <Pill tone="success">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Без интернет-запросов
          </Pill>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            aria-label="Поиск по названию, издателю или сигнатуре"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название, издатель или сигнатура"
            className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm"
          />
        </div>
        <select
          aria-label="Категория продукта"
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            setCategory(v === "Антивирус" || v === "СЗИ" || v === "Управление" ? v : "");
          }}
          className="h-9 max-w-full rounded-md border bg-card px-3 text-sm"
        >
          <option value="">Все категории</option>
          <option>Антивирус</option>
          <option>СЗИ</option>
          <option>Управление</option>
        </select>
      </div>
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        Найдено продуктов: {products.length}
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-3">Продукт / издатель</th>
              <th className="px-3 py-3">Категория</th>
              <th className="px-3 py-3">Сигнатуры названий и файлов</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="min-w-40 px-3 py-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.vendor}</div>
                </td>
                <td className="px-3 py-3">
                  <Pill
                    tone={
                      p.category === "Антивирус"
                        ? "success"
                        : p.category === "СЗИ"
                          ? "info"
                          : "neutral"
                    }
                  >
                    {p.category}
                  </Pill>
                </td>
                <td className="min-w-48 px-3 py-3 font-mono text-xs">
                  <div className="break-words">{p.signatures.join(" · ")}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Совпадений в справочнике нет.
          </p>
        )}
      </div>
      <LocalSecurityMatcher />
    </>
  );
}
