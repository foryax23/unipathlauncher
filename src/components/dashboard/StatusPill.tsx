type Status =
  | "draft"
  | "submitted"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "enrolled";

const STYLES: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/10 text-primary border-primary/30",
  interview: "bg-gold/15 text-gold-foreground dark:text-gold border-gold/40",
  offer: "bg-gold/25 text-gold-foreground dark:text-gold border-gold/50",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
  enrolled: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50",
};

const LABELS: Record<Status, string> = {
  draft: "Draft",
  submitted: "Submitted",
  interview: "Interview",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  enrolled: "Enrolled",
};

export function StatusPill({ status }: { status: string }) {
  const s = (status as Status) in STYLES ? (status as Status) : "draft";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STYLES[s]}`}
    >
      {LABELS[s]}
    </span>
  );
}
