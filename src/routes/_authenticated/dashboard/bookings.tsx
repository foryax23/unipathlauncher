import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listMyBookings, requestBooking, cancelBooking } from "@/lib/bookings.functions";
import { listAvailableSlots } from "@/lib/availability.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { CalendarClock, Video, Phone, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const bookingsQuery = queryOptions({
  queryKey: ["bookings"],
  queryFn: () => listMyBookings({}),
});

export const Route = createFileRoute("/_authenticated/dashboard/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bookingsQuery),
  component: BookingsPage,
});

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  const day = x.getUTCDay();
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function BookingsPage() {
  const { data } = useSuspenseQuery(bookingsQuery);
  const qc = useQueryClient();
  const requestFn = useServerFn(requestBooking);
  const cancelFn = useServerFn(cancelBooking);
  const slotsFn = useServerFn(listAvailableSlots);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const [pickedDay, setPickedDay] = useState<string>(() => isoDate(new Date()));
  const [picked, setPicked] = useState<{ starts_at: string; ends_at: string; adviser_id: string } | null>(null);
  const [channel, setChannel] = useState<"video" | "phone" | "in_person">("video");
  const [notes, setNotes] = useState("");

  const slotsQ = useQuery({
    queryKey: ["slots", isoDate(weekStart), isoDate(weekEnd)],
    queryFn: () => slotsFn({ data: { date_from: isoDate(weekStart), date_to: isoDate(weekEnd), slot_minutes: 30 } }),
  });

  const slotsByDay = useMemo(() => {
    const m = new Map<string, Array<{ starts_at: string; ends_at: string; adviser_id: string }>>();
    for (const s of slotsQ.data?.slots ?? []) {
      const d = s.starts_at.slice(0, 10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(s);
    }
    return m;
  }, [slotsQ.data]);

  const req = useMutation({
    mutationFn: () => {
      if (!picked) throw new Error("Pick a slot");
      return requestFn({
        data: {
          starts_at: picked.starts_at,
          ends_at: picked.ends_at,
          adviser_id: picked.adviser_id,
          channel,
          notes: notes || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Booking requested — we'll confirm shortly");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
      setPicked(null);
      setNotes("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not request"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });

  const channelIcon = (c: string) =>
    c === "video" ? <Video className="size-3.5" /> : c === "phone" ? <Phone className="size-3.5" /> : <MapPin className="size-3.5" />;

  const daySlots = slotsByDay.get(pickedDay) ?? [];

  return (
    <DashShell eyebrow="Calls" title="Adviser bookings">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="glass-strong rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-serif text-xl">Pick a slot</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} className="tap inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-accent/40"><ChevronLeft className="size-4" /></button>
              <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} className="tap inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-accent/40"><ChevronRight className="size-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = addDays(weekStart, i);
              const key = isoDate(d);
              const count = slotsByDay.get(key)?.length ?? 0;
              const active = pickedDay === key;
              const past = d < new Date(new Date().toDateString());
              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  onClick={() => { setPickedDay(key); setPicked(null); }}
                  className={`tap rounded-2xl border px-1.5 py-2 text-center transition ${active ? "border-gold bg-gold/15" : "border-border hover:bg-accent/40"} ${past ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</p>
                  <p className="mt-0.5 font-serif text-lg leading-none">{d.getUTCDate()}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{count ? `${count} free` : "—"}</p>
                </button>
              );
            })}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Available times</p>
            {slotsQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : daySlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots on this day. Pick another.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {daySlots.map((s) => {
                  const t = new Date(s.starts_at);
                  const label = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
                  const sel = picked?.starts_at === s.starts_at && picked?.adviser_id === s.adviser_id;
                  return (
                    <button
                      key={`${s.adviser_id}_${s.starts_at}`}
                      type="button"
                      onClick={() => setPicked(s)}
                      className={`tap rounded-full border px-3 py-2 text-sm transition ${sel ? "border-gold bg-gold text-gold-foreground" : "border-border hover:bg-accent/40"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Channel</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}
                className="mt-1 w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
                <option value="video">Video call</option>
                <option value="phone">Phone</option>
                <option value="in_person">In person</option>
              </select>
            </label>
            <label className="block text-sm sm:row-span-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000}
                className="mt-1 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm" />
            </label>
          </div>

          <button
            type="button"
            onClick={() => req.mutate()}
            disabled={!picked || req.isPending}
            className="tap inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            <CalendarClock className="size-4" />
            {picked ? `Request ${new Date(picked.starts_at).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}` : "Pick a slot"}
          </button>
        </div>

        <section>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your bookings</p>
          {data.bookings.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.bookings.map((b) => (
                <li key={b.id} className="glass rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg">
                        {new Date(b.starts_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-xs">
                        {channelIcon(b.channel)} {b.channel.replace("_", " ")}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-[11px] capitalize">
                      {b.status}
                    </span>
                  </div>
                  {b.notes && <p className="mt-2 text-sm text-muted-foreground">{b.notes}</p>}
                  {b.status !== "cancelled" && new Date(b.starts_at) > new Date() && (
                    <button
                      type="button"
                      onClick={() => { if (confirm("Cancel this booking?")) cancel.mutate(b.id); }}
                      className="tap mt-3 inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition"
                    >
                      <X className="size-3" /> Cancel
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashShell>
  );
}
