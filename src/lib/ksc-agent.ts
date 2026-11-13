export type AgentInstallation = "установлен" | "не установлен" | "нет данных";

export function agentInstallation(installed?: boolean): AgentInstallation {
  if (installed === true) return "установлен";
  if (installed === false) return "не установлен";
  return "нет данных";
}

export function agentAvailability(
  agent: "активен" | "не отвечает" | "нет агента",
): "отвечает" | "не отвечает" | "нет данных" {
  if (agent === "активен") return "отвечает";
  if (agent === "не отвечает") return "не отвечает";
  return "нет данных";
}
