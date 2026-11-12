import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { getAiAccess, matchAntivirus } from "@/lib/antivirus-ai.functions";
import type { MatchingResult } from "@/lib/antivirus-ai-schema";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/crm/Shell";
import { Sparkles, LoaderCircle } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";

export function AntivirusAi({ assetId }: { assetId: number }) {
  const [user, setUser] = useState(false), [admin, setAdmin] = useState(false);
  const [pc, setPc] = useState(assetId), [mode, setMode] = useState<"demo" | "manual">("manual");
  const [input, setInput] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const access = useServerFn(getAiAccess), analyze = useServerFn(matchAntivirus);
  const asset = ASSETS.find(a => a.id === pc);
  useEffect(() => {
    let live = true;
    async function refresh() {
      const { data } = await supabase.auth.getUser();
      if (!live) return;
      setUser(Boolean(data.user)); setAdmin(false);
      if (data.user) { try { const r = await access(); if (live) setAdmin(r.admin); } catch (e) { if (live) setError(e instanceof Error ? e.message : "Ошибка проверки прав."); } }
    }
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(event => { if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) setTimeout(() => void refresh(), 0); });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, [access]);
  const programs = mode === "demo" ? asset?.software || [] : input.split("\n").filter(s => s.trim()).map(line => {
    const [name = "", version = "", vendor = ""] = line.split(";"); return { name: name.trim(), version: version.trim(), vendor: vendor.trim() };
  });
  async function run() {
    setError(""); setResult(null); setBusy(true);
    try { const r = await analyze({ data: { assetId: pc, programs, source: mode } }); setResult(r.result); setError(r.error || ""); }
    catch (e) { setError(e instanceof Error ? e.message : "Проверка не выполнена."); } finally { setBusy(false); }
  }
  return <section className="mt-6 border-t pt-5" aria-labelledby="ai-antivirus-heading">
    <h2 id="ai-antivirus-heading" className="mb-3 flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5" />Сопоставление программ · ИИ</h2>
    {!user ? <div className="max-w-sm space-y-3">
      <form className="space-y-2" onSubmit={async e => { e.preventDefault(); const r = await supabase.auth.signInWithPassword({ email, password }); setError(r.error?.message || ""); }}>
        <input aria-label="Электронная почта" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-9 w-full rounded-md border bg-card px-3" />
        <input aria-label="Пароль" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="h-9 w-full rounded-md border bg-card px-3" />
        <Button type="submit">Войти</Button>
      </form>
      <Button variant="outline" onClick={async () => { const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); setError(r.error?.message || ""); }}><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Войти через Google</Button>
      <Button className="lovable-auth-button" onClick={async () => { const r = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin }); setError(r.error?.message || ""); }}>Sign in with Lovable</Button>
    </div> : !admin ? <p className="text-sm text-muted-foreground">Проверка доступна только администратору.</p> : <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Компьютер для проверки ИИ" disabled={busy} value={pc} onChange={e => { setPc(Number(e.target.value)); setResult(null); }} className="h-9 max-w-full rounded-md border bg-card px-2">{ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <select aria-label="Список программ для ИИ" disabled={busy} value={mode} onChange={e => { setMode(e.target.value === "demo" ? "demo" : "manual"); setResult(null); }} className="h-9 rounded-md border bg-card px-2"><option value="manual">Введённый список</option><option value="demo">Демонстрационные программы</option></select>
      </div>
      {mode === "manual" ? <textarea aria-label="Установленные программы" disabled={busy} placeholder="Название; версия; издатель" value={input} onChange={e => { setInput(e.target.value); setResult(null); }} rows={5} className="w-full rounded-md border bg-card p-3 font-mono text-sm" /> : <div className="text-sm text-muted-foreground">Демонстрационный список · {programs.length} программ</div>}
      <Button disabled={busy || !programs.length} onClick={run}>{busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{busy ? "Проверка…" : "Сопоставить антивирусы"}</Button>
      {result && <div className="space-y-3" aria-live="polite"><Pill tone="info">{mode === "demo" ? "Результат на демонстрационных данных" : "Результат по введённому списку"}</Pill>{result.matches.map(m => <div key={m.programIndex} className="border-b py-3"><div className="flex flex-wrap items-center gap-2"><b>{m.antivirusName || programs[m.programIndex]?.name}</b><span className="font-mono text-xs">{m.version || "версия неизвестна"}</span><Pill tone={m.confidence === "confirmed" ? "success" : m.confidence === "uncertain" ? "warning" : "neutral"}>{m.confidence === "confirmed" ? "антивирус" : m.confidence === "uncertain" ? "неопределённое совпадение" : "не антивирус"}</Pill></div><p className="mt-1 text-sm text-muted-foreground">{m.explanation}</p></div>)}</div>}
    </div>}
    {error && <p role="alert" className="mt-3 break-words text-sm text-destructive">{error}</p>}
  </section>;
}