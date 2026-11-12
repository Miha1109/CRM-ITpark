import { describe, expect, it } from "vitest";
import { antivirusOf, antivirusSections, ANTIVIRUS_COLUMNS } from "@/lib/antivirus";
import { inventoryCsv } from "@/lib/inventory-csv";
import { ASSETS } from "@/lib/assets";

describe("Antivirus inventory", () => {
  it("keeps KSC antivirus data only in the KSC section", () => {
    const av = { name: "Kaspersky", version: "11", status: "активен", source: "KSC" };
    expect(antivirusSections(av)).toEqual({ ksc: av, other: null });
  });
  it("keeps antivirus data from other sources out of KSC", () => {
    const av = { name: "ESET Endpoint Antivirus", version: "12", status: "активен", source: "TNI" };
    expect(antivirusSections(av)).toEqual({ ksc: null, other: av });
  });
  it("leaves both sections unknown when no antivirus information is received", () => {
    expect(antivirusSections(antivirusOf({}))).toEqual({ ksc: null, other: null });
  });
  it("reads all four union fields from the supplied example", () => {
    expect(antivirusOf({ "Антивирус (название)": "Kaspersky Endpoint Security 11", "Антивирус (версия)": "11.2.0.724", "Антивирус (статус)": "активен", "Антивирус (источник)": "KSC" }))
      .toEqual({ name: "Kaspersky Endpoint Security 11", version: "11.2.0.724", status: "активен", source: "KSC" });
  });
  it("supports both inconsistent KSC name keys in the instructions", () => {
    expect(antivirusOf({ ksc_av: "Kaspersky", ksc_av_version: "11.2.0.724", ksc_av_status: "активен" }))
      .toEqual({ name: "Kaspersky", version: "11.2.0.724", status: "активен", source: "KSC" });
    expect(antivirusOf({ ksc_antivirus: "KES", ksc_av: "Kaspersky" }).name).toBe("KES");
  });
  it("does not treat missing antivirus data as absent protection or infer it from mock software", () => {
    expect(antivirusOf({})).toEqual({ name: "", version: "", status: "", source: "" });
  });
  it("preserves numeric KSC status zero without guessing its meaning", () => {
    expect(antivirusOf({ ksc_av_status: 0 })).toEqual({ name: "", version: "", status: "0", source: "KSC" });
  });
  it("exports the four antivirus columns and supplied values", () => {
    const asset = ASSETS[0];
    if (!asset) throw new Error("Missing fixture");
    const csv = inventoryCsv([{ ...asset, antivirus: { name: "Kaspersky Endpoint Security 11", version: "11.2.0.724", status: "активен", source: "KSC" } }]);
    expect(csv.split("\r\n")[0]).toContain(ANTIVIRUS_COLUMNS.map(c => `"${c}"`).join(","));
    expect(csv).toContain('"Kaspersky Endpoint Security 11","11.2.0.724","активен","KSC"');
  });
});