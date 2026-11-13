import { describe, expect, it } from "vitest";
import {
  matchSecurityPrograms,
  searchSecurityCatalog,
  SECURITY_CATALOG,
} from "@/lib/security-catalog";

// Explicit fixtures keep product coverage independent of catalog contents.
const productCases = [
  ["kes", "Kaspersky Endpoint Security", "Антивирус"],
  ["kav", "Kaspersky Anti-Virus", "Антивирус"],
  ["kis", "Kaspersky Internet Security", "Антивирус"],
  ["ksc", "Kaspersky Security Center", "Управление"],
  ["drweb", "Dr.Web Security Space", "Антивирус"],
  ["drweb-es", "Dr.Web Enterprise Security Suite", "Антивирус"],
  ["eset-av", "ESET Endpoint Antivirus", "Антивирус"],
  ["eset-security", "ESET Endpoint Security", "Антивирус"],
  ["nod32", "ESET NOD32 Antivirus", "Антивирус"],
  ["defender", "Microsoft Defender Antivirus", "Антивирус"],
  ["mse", "Microsoft Security Essentials", "Антивирус"],
  ["symantec", "Symantec Endpoint Protection", "Антивирус"],
  ["trellix", "McAfee Endpoint Security", "Антивирус"],
  ["sophos", "Sophos Endpoint", "Антивирус"],
  ["bitdefender", "Bitdefender Endpoint Security Tools", "Антивирус"],
  ["avast", "Avast Free Antivirus", "Антивирус"],
  ["avg", "AVG AntiVirus", "Антивирус"],
  ["avira", "Avira Antivirus", "Антивирус"],
  ["trend", "Trend Micro Apex One", "Антивирус"],
  ["clamav", "ClamAV", "Антивирус"],
  ["secret-net", "Secret Net Studio", "СЗИ"],
  ["vips", "ViPNet Client", "СЗИ"],
  ["cryptopro", "КриптоПро CSP", "СЗИ"],
  ["kontinent", "Континент-АП", "СЗИ"],
  ["sobol", "ПАК Соболь", "СЗИ"],
  ["dallas", "Dallas Lock", "СЗИ"],
  ["infowatch", "InfoWatch Traffic Monitor", "СЗИ"],
  ["searchinform", "СёрчИнформ КИБ", "СЗИ"],
  ["device-lock", "DeviceLock", "СЗИ"],
  ["zecurion", "Zecurion DLP", "СЗИ"],
] as const;

describe("local antivirus and security software signatures", () => {
  it("covers exactly all 30 catalog products with independent fixtures", () => {
    expect(productCases).toHaveLength(30);
    expect(productCases.map(([id]) => id).sort()).toEqual(SECURITY_CATALOG.map((p) => p.id).sort());
  });
  it.each(productCases)("identifies %s with its expected category", (id, name, category) => {
    const results = matchSecurityPrograms(`${name};12.6;Unknown publisher`);
    expect(results).toHaveLength(1);
    expect(results[0]?.matches.map((m) => [m.product.id, m.product.category])).toEqual([
      [id, category],
    ]);
  });
  it.each(
    SECURITY_CATALOG.flatMap((product) =>
      product.signatures.map((signature) => ({ id: product.id, signature })),
    ),
  )("recognizes literal alias $signature as $id after normalization", ({ id, signature }) => {
    const input = `  ${signature
      .toUpperCase()
      .replace(/Ё/g, "Е")
      .replace(/[. -]+/g, "__")}  ;5.0;publisher`;
    const matches = matchSecurityPrograms(input)[0]?.matches;
    expect(matches?.map((m) => m.product.id)).toEqual([id]);
    expect(matches?.[0]?.signatures).toContain(signature);
  });
  it.each([
    ["Kaspersky Endpoint Security / Kaspersky Network Agent", ["kes", "ksc"]],
    ["ClamAV / КриптоПро CSP / DeviceLock", ["clamav", "cryptopro", "device-lock"]],
    ["Dr.Web Security Space / Dr.Web Agent", ["drweb", "drweb-es"]],
    ["ESET Endpoint Security / ESET Endpoint Antivirus", ["eset-av", "eset-security"]],
  ])("preserves every candidate for ambiguous input %s", (input, ids) => {
    expect(matchSecurityPrograms(input)[0]?.matches.map((m) => m.product.id)).toEqual(ids);
  });
  it("collects overlapping aliases without duplicating a product", () => {
    const matches = matchSecurityPrograms("Secret Net Studio / Secret Net")[0]?.matches;
    expect(matches?.map((m) => m.product.id)).toEqual(["secret-net"]);
    expect(matches?.[0]?.signatures).toEqual(["Secret Net Studio", "Secret Net"]);
  });
  it.each([
    "Неизвестная программа",
    "unknown",
    "null",
    "undefined",
    "N/A",
    "нет данных",
    "—",
    "12345",
    "Google Chrome;130;Microsoft",
    "Unknown;ClamAV;Kaspersky Endpoint Security",
    "Kaspersky",
    "Microsoft",
    "ESET",
    "KES",
    "NotClamAV",
    "DeviceLocker",
    "NotMsMpEng.exe",
  ])("returns no candidate for unknown or insufficient value %s", (input) => {
    expect(matchSecurityPrograms(input)).toEqual([{ input, matches: [] }]);
  });
  it("preserves unknown rows and repeated rows in a mixed CRLF list", () => {
    const results = matchSecurityPrograms("\r\n ClamAV \r\n Unknown \r\n\r\n ClamAV\r\n");
    expect(results.map((r) => [r.input, r.matches.map((m) => m.product.id)])).toEqual([
      ["ClamAV", ["clamav"]],
      ["Unknown", []],
      ["ClamAV", ["clamav"]],
    ]);
  });
  it("matches antivirus names without case or punctuation dependence", () => {
    expect(
      matchSecurityPrograms("KASPERSKY Endpoint-Security 12;12.6;vendor")[0]?.matches.map(
        (m) => m.product.id,
      ),
    ).toEqual(["kes"]);
  });
  it("recognizes Russian security software signatures", () => {
    expect(
      matchSecurityPrograms("КриптоПро CSP;5.0;КриптоПро")[0]?.matches[0]?.product.category,
    ).toBe("СЗИ");
  });
  it("keeps administration agents separate from antivirus products", () => {
    expect(
      matchSecurityPrograms("Kaspersky Security Center Network Agent")[0]?.matches.map((m) => [
        m.product.id,
        m.product.category,
      ]),
    ).toEqual([["ksc", "Управление"]]);
  });
  it("does not identify products by vendor alone or partial words", () => {
    expect(
      matchSecurityPrograms("Chrome;130;Kaspersky\nNotClamAV\nKaspersky\nKES").every(
        (r) => r.matches.length === 0,
      ),
    ).toBe(true);
  });
  it("returns every candidate rather than silently selecting one", () => {
    expect(
      matchSecurityPrograms("ESET Endpoint Antivirus / ESET Endpoint Security")[0]?.matches.map(
        (m) => m.product.id,
      ),
    ).toEqual(["eset-av", "eset-security"]);
  });
  it("handles empty and CRLF program lists", () => {
    expect(matchSecurityPrograms(" \r\n")).toEqual([]);
    expect(
      matchSecurityPrograms("ClamAV\r\n\r\nDeviceLock").map((r) => r.matches[0]?.product.id),
    ).toEqual(["clamav", "device-lock"]);
  });
  it("searches signatures and restricts results to the selected category", () => {
    expect(searchSecurityCatalog("MsMpEng.exe").map((p) => p.id)).toEqual(["defender"]);
    expect(searchSecurityCatalog("", "СЗИ").every((p) => p.category === "СЗИ")).toBe(true);
    expect(searchSecurityCatalog("несуществующий продукт")).toEqual([]);
  });
  it("does not modify supplied inventory facts or infer status", () => {
    const row = { name: "ESET Endpoint Antivirus", status: "", version: "12" };
    const before = { ...row };
    const result = matchSecurityPrograms(row.name);
    expect(row).toEqual(before);
    expect(result[0]?.matches[0]).not.toHaveProperty("status");
  });
  it("has unique identifiers and nonempty literal signatures", () => {
    expect(new Set(SECURITY_CATALOG.map((p) => p.id)).size).toBe(SECURITY_CATALOG.length);
    expect(
      SECURITY_CATALOG.every(
        (p) => p.signatures.length > 0 && p.signatures.every((s) => s.trim().length > 0),
      ),
    ).toBe(true);
  });
});
