import { describe, expect, it } from "vitest";
import { requireAdminRole, validateMatching } from "@/lib/antivirus-ai-schema";
import { matchesAntivirusFilter, antivirusOf, otherAntivirusPrograms } from "@/lib/antivirus";

describe("Antivirus AI and inventory rules", () => {
  it("denies non-administrators", () => { expect(() => requireAdminRole(false)).toThrow(); expect(() => requireAdminRole(true)).not.toThrow(); });
  it("rejects model-invented versions", () => {
    expect(() => validateMatching({ matches: [{ programIndex: 0, antivirusName: "ESET", version: "99", confidence: "confirmed", explanation: "" }] }, [{ name: "ESET", version: "12", vendor: "ESET" }])).toThrow();
  });
  it("filters protection on the same matching antivirus", () => {
    const records = [{ name: "ESET", version: "12", status: "активен", source: "TNI" }, { name: "Defender", version: "", status: "выключен", source: "TNI" }];
    expect(matchesAntivirusFilter(records, "ESET", "активен")).toBe(true);
    expect(matchesAntivirusFilter(records, "ESET", "выключен")).toBe(false);
    expect(matchesAntivirusFilter(records, "__unknown", "")).toBe(false);
    expect(matchesAntivirusFilter([], "__unknown", "__unknown")).toBe(true);
  });
  it("preserves independent name/version provenance without fabricating dates", () => {
    const av = antivirusOf({ "Антивирус (название)": "ESET", "Антивирус (версия)": "12", antivirusNameSource: "TNI", antivirusNameUpdatedAt: "2026-11-11 08:00", antivirusVersionSource: "AD", antivirusVersionUpdatedAt: "2026-11-10 07:00" });
    expect(av.nameSource).toBe("TNI"); expect(av.nameUpdatedAt).toBe("2026-11-11 08:00"); expect(av.versionSource).toBe("AD"); expect(av.versionUpdatedAt).toBe("2026-11-10 07:00");
    expect(antivirusOf({}).nameUpdatedAt).toBeUndefined();
  });
  it("keeps all imported other-antivirus programs", () => {
    const programs = [{ name: "ESET", version: "12", status: "", source: "TNI" }, { name: "Defender", version: "4", status: "", source: "Windows" }];
    expect(otherAntivirusPrograms({ antivirusPrograms: programs }, antivirusOf({}))).toEqual(programs);
  });
});