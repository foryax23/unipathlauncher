import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMyBookings, requestBooking, cancelBooking } from "@/lib/bookings.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { CalendarClock, Video, Phone, MapPin, X } from "lucide-react";
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

function defaultSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(0, 0, 0);
  d.setHours(14);
  return d.toISOString().slice(0, 16);
}

function BookingsPage() {
  const { data } = useSuspenseQuery(bookingsQuery);
  const qc = useQueryClient();
  const requestFn = useServerFn(requestBooking);
  const cancelFn = useServerFn(cancelBooking);

  const [start, setStart] = useState(defaultSlot());
  const [duration, setDuration] = useState(30);
  const [channel, setChannel] = useState<"video" | "phone" | "in_person">("video");
  const [notes, setNotes] = useState("");

  const req = useMutation({
    mutationFn: () => {
      const startsAt = new Date(start);
      const endsAt = new Date(startsAt.getTime() + duration * 60_000);
      return requestFn({
        data: {
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          channel,
          notes: notes || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Booking requested — we'll confirm shortly");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      setNotes("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not request"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const channelIcon = (c: string) =>
    c === "video" ? <Video className="size-3.5" /> : c === "phone" ? <Phone className="size-3.5" /> : <MapPin className="size-3.5" />;

  return (
    <DashShell eyebrow="Calls" title="Adviser bookings">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); req.mutate(); }}
          className="glass-strong rounded-3xl p-6 space-y-4"
        >
          <p className="font-serif text-xl">Request a slot</p>
          <label className="block text-sm">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">When</span>
            <input
              type="datetime-local"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Duration</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Channel</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as typeof channel)}
                className="mt-1 w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm"
              >
                <option value="video">Video call</option>
                <option value="phone">Phone</option>
                <option value="in_person">In person</option>
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Anything we should know?</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={req.isPending}
            className="tap inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
          >
            <CalendarClock className="size-4" /> {req.isPending ? "Requesting…" : "Request booking"}
          </button>
        </form>

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
                        {new Date(b.starts_at).toLocaleString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-xs">
                        {channelIcon(b.channel)} {b.channel.replace("_", " ")}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-[11px] capitalize">
                      {b.status}
                    </span>
                  </div>
                  {b.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{b.notes}</p>
                  )}
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
