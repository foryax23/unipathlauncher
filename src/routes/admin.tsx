import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listLeads } from "@/lib/leads.functions";
import {
  getMyAdminStatus,
  listStudents,
  getStudent,
  sendPasswordReset,
} from "@/lib/admin.functions";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Copy,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin · Bridge Gateway" },
      { name: "description", content: "Adviser workspace for Bridge Gateway Consulting." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: "/admin" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setEmail(session?.user?.email ?? null),
    );
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <main className="hero-warm min-h-[calc(100vh-4rem)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          {checking ? (
            <div className="glass-strong mt-10 rounded-3xl p-10 text-muted-foreground">
              Checking session…
            </div>
          ) : email ? (
            <AdminWorkspace signedInEmail={email} />
          ) : (
            <SignIn />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md">
      <div className="glass-strong rounded-3xl p-7 shadow-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Adviser sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with your adviser email.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="tap w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/reset-password" className="underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminWorkspace({ signedInEmail }: { signedInEmail: string }) {
  const checkAdmin = useServerFn(getMyAdminStatus);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkAdmin()
      .then((r) => !cancelled && setIsAdmin(r.isAdmin))
      .catch(() => !cancelled && setIsAdmin(false));
    return () => {
      cancelled = true;
    };
  }, [checkAdmin]);

  if (isAdmin === null) {
    return (
      <div className="glass-strong mt-10 rounded-3xl p-10 text-muted-foreground">
        Verifying access…
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="glass-strong mx-auto mt-10 max-w-md rounded-3xl p-8 text-center">
        <h2 className="font-serif text-2xl text-foreground">Not authorised</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {signedInEmail} doesn't have admin access. Contact the team to be added.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header card */}
      <div className="glass-strong flex flex-col gap-4 rounded-3xl px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">
            Adviser inbox
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">
            Signed in as <span className="text-foreground">{signedInEmail}</span>
          </span>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <Tabs defaultValue="students" className="mt-6">
        <TabsList className="glass rounded-full p-1">
          <TabsTrigger value="students" className="rounded-full px-5">Students</TabsTrigger>
          <TabsTrigger value="leads" className="rounded-full px-5">Leads</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-6">
          <StudentsTab />
        </TabsContent>
        <TabsContent value="leads" className="mt-6">
          <LeadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Student = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  subject: string | null;
  study_level: string | null;
  start_year: string | null;
  onboarding_complete: boolean;
  created_at: string;
  email: string | null;
};

function StudentsTab() {
  const fetchStudents = useServerFn(listStudents);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Student | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStudents({ data: {} })
      .then((r) => !cancelled && setStudents(r.students as Student[]))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      cancelled = true;
    };
  }, [fetchStudents]);

  const filtered = useMemo(() => {
    if (!students) return [];
    const s = search.trim().toLowerCase();
    return students.filter((st) => {
      if (s) {
        const hay = `${st.full_name ?? ""} ${st.email ?? ""} ${st.city ?? ""} ${st.subject ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (level !== "all" && st.study_level !== level) return false;
      if (year !== "all" && st.start_year !== year) return false;
      if (status === "complete" && !st.onboarding_complete) return false;
      if (status === "incomplete" && st.onboarding_complete) return false;
      return true;
    });
  }, [students, search, level, year, status]);

  const hasFilter = search || level !== "all" || year !== "all" || status !== "all";
  const resetFilters = () => {
    setSearch("");
    setLevel("all");
    setYear("all");
    setStatus("all");
  };

  return (
    <div>
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, city, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-11 w-[170px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="Foundation">Foundation</SelectItem>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-11 w-[150px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="complete">Onboarding complete</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
          <span className="ml-auto inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
            {students ? `${filtered.length} of ${students.length}` : "Loading…"}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Name", "Email", "City", "Subject", "Level", "Year", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!students && (
                <SkeletonRows columns={8} rows={6} />
              )}
              {students && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-muted-foreground">
                      <UserRound className="h-8 w-8 opacity-50" />
                      <p>No students match these filters.</p>
                      {hasFilter && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((st) => (
                <tr
                  key={st.id}
                  onClick={() => setSelected(st)}
                  className="cursor-pointer text-foreground transition hover:bg-muted/40"
                >
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium" title={st.full_name ?? ""}>
                    {st.full_name ?? "–"}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3" title={st.email ?? ""}>
                    {st.email ?? "–"}
                  </td>
                  <td className="px-4 py-3">{st.city ?? "–"}</td>
                  <td className="px-4 py-3">{st.subject ?? "–"}</td>
                  <td className="px-4 py-3">{st.study_level ?? "–"}</td>
                  <td className="px-4 py-3">{st.start_year ?? "–"}</td>
                  <td className="px-4 py-3">
                    <StatusPill complete={st.onboarding_complete} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(st.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentSheet
        userId={selected?.user_id ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function StatusPill({ complete }: { complete: boolean }) {
  return complete ? (
    <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
      Complete
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
      Incomplete
    </span>
  );
}

function SkeletonRows({ columns, rows }: { columns: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function copy(text: string | null | undefined, label = "Copied") {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label}: ${text}`),
    () => toast.error("Copy failed"),
  );
}

function initialsOf(name?: string | null, email?: string | null) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function StudentSheet({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const fetchStudent = useServerFn(getStudent);
  const sendReset = useServerFn(sendPasswordReset);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchStudent>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStudent({ data: { userId } })
      .then((r) => !cancelled && setData(r))
      .catch(() => !cancelled && setData(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, fetchStudent]);

  const p = data?.profile;

  const handleSendReset = async () => {
    if (!data?.email) return;
    setSendingReset(true);
    try {
      await sendReset({
        data: { email: data.email, redirectTo: window.location.origin + "/reset-password" },
      });
      toast.success(`Reset link sent to ${data.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <Sheet open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
              {initialsOf(p?.full_name, data?.email)}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate font-serif text-2xl">
                {p?.full_name ?? "Student"}
              </SheetTitle>
              <SheetDescription className="truncate">{data?.email ?? ""}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

        {data && !loading && (
          <div className="mt-6 space-y-6 text-sm">
            <div className="flex flex-wrap gap-2">
              {data.email && (
                <>
                  <a
                    href={`mailto:${data.email}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(data.email, "Email")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReset}
                    disabled={sendingReset}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {sendingReset ? "Sending…" : "Send password reset"}
                  </button>
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Section title="Contact">
                <Row k="Full name" v={p?.full_name} />
                <Row k="Email" v={data.email} />
                <Row k="Phone" v={p?.phone} />
              </Section>

              <Section title="Location">
                <Row k="City" v={p?.city} />
                <Row k="Country" v={p?.country} />
                {p?.lat && p?.lng && (
                  <Row
                    k="Map"
                    v={
                      <a
                        className="inline-flex items-center gap-1 text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                      >
                        <MapPin className="h-3 w-3" /> Open
                      </a>
                    }
                  />
                )}
              </Section>

              <Section title="Study plan">
                <Row k="Subject" v={p?.subject} />
                <Row k="Level" v={p?.study_level} />
                <Row k="Start year" v={p?.start_year} />
              </Section>

              <Section title="Account">
                <Row k="Onboarding" v={p?.onboarding_complete ? "Complete" : "Incomplete"} />
                <Row
                  k="Joined"
                  v={data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "–"}
                />
                <Row
                  k="Last sign-in"
                  v={data.lastSignInAt ? new Date(data.lastSignInAt).toLocaleDateString("en-GB") : "–"}
                />
              </Section>
            </div>

            {p?.reason && (
              <Section title="Notes">
                <p className="text-foreground">{p.reason}</p>
              </Section>
            )}

            {data.leads.length > 0 && (
              <Section title={`Lead submissions (${data.leads.length})`}>
                <ul className="space-y-2">
                  {data.leads.map((l: any) => (
                    <li
                      key={l.id}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleString("en-GB")} · {l.source ?? "direct"}
                      </div>
                      <div className="mt-1">
                        {l.subject} · {l.study_level} · start {l.start_year}
                      </div>
                      {l.reason && (
                        <div className="mt-1 text-muted-foreground">{l.reason}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4">
        {children}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right text-foreground">{v || "–"}</span>
    </div>
  );
}

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  study_level: string;
  start_year: string;
  reason: string | null;
  source: string | null;
};

function LeadsTab() {
  const fetchLeads = useServerFn(listLeads);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchLeads()
      .then((r) => !cancelled && setLeads(r.leads as Lead[]))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed"));
    return () => {
      cancelled = true;
    };
  }, [fetchLeads]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const s = search.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      `${l.name} ${l.email} ${l.city} ${l.subject}`.toLowerCase().includes(s),
    );
  }, [leads, search]);

  return (
    <div>
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          <span className="ml-auto inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
            {leads ? `${filtered.length} leads` : "Loading…"}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Name", "Email", "Phone", "City", "Subject", "Level", "Year", "Submitted", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!leads && <SkeletonRows columns={9} rows={5} />}
              {leads && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-muted-foreground">
                    No leads.
                  </td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="text-foreground hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3">{l.email}</td>
                  <td className="px-4 py-3">{l.phone}</td>
                  <td className="px-4 py-3">{l.city}</td>
                  <td className="px-4 py-3">{l.subject}</td>
                  <td className="px-4 py-3">{l.study_level}</td>
                  <td className="px-4 py-3">{l.start_year}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <a
                        href={`mailto:${l.email}`}
                        title="Email"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => copy(l.email, "Email")}
                        title="Copy email"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
