import { describe, expect, it } from "vitest";
import { parseCheckFlag, relatedBySource, ASSETS } from "./asset";

describe("check_flag parsing", () => {
  it("nagent gap over 10 minutes is overdue", () => {
    expect(parseCheckFlag("KSC: nagent/visible расходятся 100562 мин (> 10)").nagentOverdueMin).toBe(100562);
  });
  it("nagent gap of 10 minutes is not overdue", () => {
    expect(parseCheckFlag("KSC: nagent/visible расходятся 10 мин").nagentOverdueMin).toBeNull();
  });
  it("extracts TNI name and other IP", () => {
    const f = parseCheckFlag(
      "KSC имя совпадает с TNI (mose-6174, IP 10.177.104.210) — другой участок, не объединять (якоря KSC: S/N=—, MAC=—); KSC: nagent/visible расходятся 685671 мин (> 10)",
    );
    expect(f.nameMatch).toEqual({ tniName: "mose-6174", tniIp: "10.177.104.210" });
    expect(f.nagentOverdueMin).toBe(685671);
  });
  it("ok means no flags", () => {
    expect(parseCheckFlag("ok").ok).toBe(true);
  });
  it("groups same name across sources", () => {
    const k = ASSETS.find((a) => a.short_name === "MOSE-6174")!;
    const g = relatedBySource(k);
    expect(g.TNI.length).toBe(1);
    expect(g.KSC.length).toBe(1);
  });
});
