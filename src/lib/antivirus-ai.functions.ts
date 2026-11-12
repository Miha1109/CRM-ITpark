import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { programSchema, requireAdminRole, validateMatching } from "@/lib/antivirus-ai-schema";

export const getAiAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Не удалось проверить права администратора.");
  return { admin: data === true };
});

export const matchAntivirus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ assetId: z.number().int().positive(), programs: z.array(programSchema).min(1).max(100), source: z.enum(["manual", "demo"]) }))
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireAdminRole(!role.error && role.data === true);
    const control = await context.supabase.from("antivirus_ai_controls").select("blocked,message").eq("id", "antivirus").maybeSingle();
    if (control.error) throw new Error("Не удалось проверить доступность ИИ.");
    if (control.data?.blocked) return { result: null, error: control.data.message };
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { result: null, error: "Проверка ИИ не настроена." };
    const { analyzePrograms } = await import("@/lib/ai/antivirus.server");
    const outcome = await analyzePrograms(getRequest(), key, data.programs);
    if (outcome.blocked) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const saved = await supabaseAdmin.from("antivirus_ai_controls").upsert({ id: "antivirus", blocked: true, message: outcome.error || "Доступ к ИИ приостановлен." });
      if (saved.error) throw new Error("Не удалось сохранить приостановку ИИ.");
    }
    return { result: outcome.result ? validateMatching(outcome.result, data.programs) : null, error: outcome.error };
  });