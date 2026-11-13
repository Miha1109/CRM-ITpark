import { describe, expect, it } from "vitest";
import { agentInstallation, agentAvailability } from "@/lib/ksc-agent";
import { ASSETS } from "@/lib/assets";

describe("KSC agent installation and availability", () => {
  it("requires explicit confirmation for installed", () => {
    expect(agentInstallation(true)).toBe("установлен");
  });
  it("requires explicit confirmation for not installed", () => {
    expect(agentInstallation(false)).toBe("не установлен");
  });
  it("keeps missing installation evidence unknown", () => {
    expect(agentInstallation()).toBe("нет данных");
    expect(ASSETS.every((a) => agentInstallation(a.ksc_agent_installed) === "нет данных")).toBe(
      true,
    );
  });
  it("does not equate no response with no installation", () => {
    expect(agentAvailability("не отвечает")).toBe("не отвечает");
    expect(agentInstallation(true)).toBe("установлен");
  });
  it("does not treat the old simulated absent-agent state as evidence", () => {
    expect(agentAvailability("нет агента")).toBe("нет данных");
  });
});
