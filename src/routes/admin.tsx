import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listLeads } from "@/lib/leads.functions";
import {
  getMyAdminStatus,
  listStudents,
  getStudent,
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

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · UniPath" }] }),
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
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
          Adviser inbox
        </h1>
        {checking ? (
          <p className="mt-8 text-muted-foreground">Checking session…</p>
        ) : email ? (
          <AdminWorkspace signedInEmail={email} />
        ) : (
          <SignIn />
        )}
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
    <form
      onSubmit={onSubmit}
      className="mt-10 max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm"
    >
      <h2 className="font-serif text-2xl text-foreground">Adviser sign in</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with your adviser email.
      </p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-12 w-full rounded-lg border border-border bg-background px-3.5 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-12 w-full rounded-lg border border-border bg-background px-3.5 text-sm"
          />
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
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
    return <p className="mt-10 text-muted-foreground">Verifying access…</p>;
  }
  if (!isAdmin) {
    return (
      <div className="mt-10 rounded-2xl border border-border bg-surface p-8">
        <h2 className="font-serif text-2xl text-foreground">Not authorised</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {signedInEmail} doesn't have admin access. Contact the team to be added.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{signedInEmail}</span>
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          Sign out
        </button>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
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

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, email, city, subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 max-w-sm"
        />
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
        <span className="ml-auto inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
          {students ? `${filtered.length} of ${students.length}` : "Loading…"}
        </span>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Name", "Email", "City", "Subject", "Level", "Year", "Status", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No students match these filters.
                </td>
              </tr>
            )}
            {filtered.map((st) => (
              <tr
                key={st.id}
                onClick={() => setSelected(st)}
                className="cursor-pointer text-foreground transition hover:bg-muted/40"
              >
                <td className="px-4 py-3 font-medium">{st.full_name ?? "—"}</td>
                <td className="px-4 py-3">{st.email ?? "—"}</td>
                <td className="px-4 py-3">{st.city ?? "—"}</td>
                <td className="px-4 py-3">{st.subject ?? "—"}</td>
                <td className="px-4 py-3">{st.study_level ?? "—"}</td>
                <td className="px-4 py-3">{st.start_year ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      st.onboarding_complete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {st.onboarding_complete ? "Complete" : "Incomplete"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(st.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StudentSheet
        userId={selected?.user_id ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function StudentSheet({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const fetchStudent = useServerFn(getStudent);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchStudent>> | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Sheet open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">
            {p?.full_name ?? "Student"}
          </SheetTitle>
          <SheetDescription>{data?.email ?? ""}</SheetDescription>
        </SheetHeader>

        {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

        {data && !loading && (
          <div className="mt-6 space-y-6 text-sm">
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
                  k="Coordinates"
                  v={
                    <a
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                    >
                      {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                    </a>
                  }
                />
              )}
            </Section>

            <Section title="Study plan">
              <Row k="Subject" v={p?.subject} />
              <Row k="Level" v={p?.study_level} />
              <Row k="Start year" v={p?.start_year} />
              <Row k="Reason / notes" v={p?.reason} />
            </Section>

            <Section title="Account">
              <Row k="Onboarding" v={p?.onboarding_complete ? "Complete" : "Incomplete"} />
              <Row
                k="Joined"
                v={data.createdAt ? new Date(data.createdAt).toLocaleString("en-GB") : "—"}
              />
              <Row
                k="Last sign-in"
                v={data.lastSignInAt ? new Date(data.lastSignInAt).toLocaleString("en-GB") : "—"}
              />
            </Section>

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
      <span className="text-right text-foreground">{v || "—"}</span>
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
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 max-w-sm"
        />
        <span className="ml-auto inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
          {leads ? `${filtered.length} leads` : "Loading…"}
        </span>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Name", "Email", "Phone", "City", "Subject", "Level", "Year", "Submitted"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No leads.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="text-foreground">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3">{l.phone}</td>
                <td className="px-4 py-3">{l.city}</td>
                <td className="px-4 py-3">{l.subject}</td>
                <td className="px-4 py-3">{l.study_level}</td>
                <td className="px-4 py-3">{l.start_year}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
