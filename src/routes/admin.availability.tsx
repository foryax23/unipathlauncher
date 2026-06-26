import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminBeforeLoad } from "@/components/admin/route-guard";
import {
  listMyAvailability, upsertAvailability, deleteAvailability,
} from "@/lib/availability.functions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

type Slot = { id: string; weekday: number; start_time: string; end_time: string; timezone: string };

export const Route = createFileRoute("/admin/availability")({
  beforeLoad: () => requireAdminBeforeLoad({ to: "/admin/availability" }),
  head: () => ({ meta: [{ title: "Availability · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminAvailabilityPage,
});

function AdminAvailabilityPage() {
  const fetchSlots = useServerFn(listMyAvailability);
  const save = useServerFn(upsertAvailability);
  const del = useServerFn(deleteAvailability);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [draft, setDraft] = useState({ weekday: 1, start_time: "09:00", end_time: "17:00" });

  const reload = () => fetchSlots().then((r) => setSlots(r.slots as Slot[]));
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  const add = async () => {
    try {
      await save({ data: { ...draft, timezone: "Europe/London" } });
      toast.success("Added"); reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const remove = async (id: string) => {
    try { await del({ data: { id } }); toast.success("Removed"); reload(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <AdminShell eyebrow="Scheduling" title="My availability">
      <p className="text-sm text-muted-foreground mb-4">
        Set the recurring weekly hours when you accept calls. Times are in Europe/London.
      </p>

      <div className="glass-strong rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Day</span>
            <Select value={String(draft.weekday)} onValueChange={(v) => setDraft((d) => ({ ...d, weekday: Number(v) }))}>
              <SelectTrigger className="mt-1 h-11 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Start</span>
            <Input type="time" value={draft.start_time} onChange={(e) => setDraft((d) => ({ ...d, start_time: e.target.value }))} className="mt-1 h-11 w-[140px]" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">End</span>
            <Input type="time" value={draft.end_time} onChange={(e) => setDraft((d) => ({ ...d, end_time: e.target.value }))} className="mt-1 h-11 w-[140px]" />
          </label>
          <button
            type="button"
            onClick={add}
            className="tap inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> Add slot
          </button>
        </div>
      </div>

      <div className="glass-strong overflow-hidden rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>{["Day","Start","End","Timezone",""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slots.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No slots yet.</td></tr>}
            {slots.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{DAYS[s.weekday]}</td>
                <td className="px-4 py-3">{s.start_time.slice(0,5)}</td>
                <td className="px-4 py-3">{s.end_time.slice(0,5)}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.timezone}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(s.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
