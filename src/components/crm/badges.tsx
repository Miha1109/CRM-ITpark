import { Pill, type Tone } from "./Shell";
import { STATUS_LABEL, SYNC_LABEL, type AssetStatus, type SyncState } from "@/lib/assets";
const ST: Record<AssetStatus, Tone> = {
  active: "success",
  repair: "warning",
  decommissioned: "neutral",
};
const SY: Record<SyncState, Tone> = { synced: "success", pending: "info", conflict: "danger" };
export const StatusBadge = ({ s }: { s: AssetStatus }) => (
  <Pill tone={ST[s]}>{STATUS_LABEL[s]}</Pill>
);
export const SyncBadge = ({ s }: { s: SyncState }) => <Pill tone={SY[s]}>{SYNC_LABEL[s]}</Pill>;
export const SourceBadge = ({ s }: { s: string }) => (
  <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
    {s}
  </span>
);
