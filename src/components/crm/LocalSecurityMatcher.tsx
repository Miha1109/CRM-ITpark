import { useState } from "react";
import { Search, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/crm/Shell";
import { matchSecurityPrograms, type LocalProgramMatch } from "@/lib/security-catalog";

export function LocalSecurityMatcher() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LocalProgramMatch[] | null>(null);
  return <section className="border-t pt-5" aria-labelledby="local-match-heading">
    <h2 id="local-match-heading" className="mb-3 text-lg font-semibold">Локальное сопоставление программ</h2>
    <form onSubmit={e => { e.preventDefault(); setResult(matchSecurityPrograms(input)); }} className="space-y-3">
      <label htmlFor="local-programs" className="block text-sm font-medium">Список программ</label>
      <textarea id="local-programs" value={input} onChange={e => { setInput(e.target.value); setResult(null); }} placeholder="Kaspersky Endpoint Security; 12.6.0.438; Kaspersky&#10;КриптоПро CSP; 5.0; КриптоПро" rows={5} className="w-full rounded-md border bg-card p-3 font-mono text-sm" />
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={!input.trim()}><Search />Сопоставить локально</Button><Button type="button" variant="outline" disabled={!input && !result} onClick={() => { setInput(""); setResult(null); }}><Eraser />Очистить</Button></div>
    </form>
    {result && <div className="mt-4" aria-live="polite">
      <p className="mb-3 text-sm text-muted-foreground">Строк: {result.length} · С совпадениями: {result.filter(r => r.matches.length).length}</p>
      <ul className="divide-y">{result.map((r, i) => <li key={i} className="min-w-0 py-3">
        <div className="break-words font-mono text-sm">{r.input}</div>
        {!r.matches.length ? <p className="mt-1 text-sm text-muted-foreground">Совпадений нет · наличие защиты неизвестно</p> : r.matches.map(m => <div key={m.product.id} className="mt-2 space-y-1">
          <div className="flex flex-wrap items-center gap-2"><b className="break-words text-sm">{m.product.name}</b><Pill tone="info">{m.product.category}</Pill><Pill tone="warning">{r.matches.length > 1 ? "несколько совпадений" : "совпадение сигнатуры"}</Pill></div>
          <p className="break-words text-xs text-muted-foreground">Сигнатуры: {m.signatures.join(", ")}</p>
        </div>)}
      </li>)}</ul>
      <p className="mt-3 text-xs text-muted-foreground">Источник: локальный справочник. Статус защиты и установка не подтверждены; данные устройства не изменены.</p>
    </div>}
  </section>;
}
