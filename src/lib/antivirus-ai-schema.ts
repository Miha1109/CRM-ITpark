import { z } from "zod";

export const programSchema = z.object({ name: z.string().min(1).max(300), version: z.string().max(100), vendor: z.string().max(300) });
export const matchingSchema = z.object({ matches: z.array(z.object({
  programIndex: z.number(), antivirusName: z.string().nullable(), version: z.string().nullable(),
  confidence: z.enum(["confirmed", "uncertain", "not_antivirus"]), explanation: z.string(),
})) });
export type MatchingResult = z.infer<typeof matchingSchema>;
export function requireAdminRole(admin: boolean) {
  if (!admin) throw new Error("Проверка ИИ доступна только администратору.");
}
export function validateMatching(result: MatchingResult, programs: z.infer<typeof programSchema>[]): MatchingResult {
  const indices = new Set<number>();
  for (const match of result.matches) {
    if (!Number.isInteger(match.programIndex) || !programs[match.programIndex] || indices.has(match.programIndex)) throw new Error("ИИ вернул некорректное сопоставление программ.");
    indices.add(match.programIndex);
    const program = programs[match.programIndex];
    if (match.version && match.version !== program?.version) throw new Error("ИИ указал версию, которой нет в исходном списке.");
  }
  if (indices.size !== programs.length) throw new Error("ИИ проверил не все программы.");
  return result;
}