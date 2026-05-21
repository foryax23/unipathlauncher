import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listLeads } from "@/lib/leads.functions";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · UniPath" }] }),
  component: AdminPage,
});

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

function AdminPage() {
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ? { email: session.user.email ?? null } : null),
    );
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { email: data.session.user.email ?? null } : null);
      setChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
          Lead inbox
        </h1>
        {checking ? (
          <p className="mt-8 text-muted-foreground">Checking session…</p>
        ) : user ? (
          <LeadsTable signedInEmail={user.email} />
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
        Use the admin account credentials provided to you.
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
      <p className="mt-6 text-xs text-muted-foreground">
        To create the first admin: sign up with an account, then in Lovable Cloud
        add a row to <code>user_roles</code> with your user_id and role
        <code> admin</code>.
      </p>
    </form>
  );
}

function LeadsTable({ signedInEmail }: { signedInEmail: string | null }) {
  const fetchLeads = useServerFn(listLeads);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeads()
      .then((res) => !cancelled && setLeads(res.leads as Lead[]))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, [fetchLeads]);

  const exportCsv = () => {
    if (!leads) return;
    const headers = [
      "Name",
      "Email",
      "Phone",
      "City",
      "Subject",
      "Level",
      "Start Year",
      "Reason",
      "Source",
      "Submitted",
    ];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.city,
      l.subject,
      l.study_level,
      l.start_year,
      l.reason ?? "",
      l.source ?? "",
      new Date(l.created_at).toISOString(),
    ]);
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unipath-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
            {leads?.length ?? "…"} leads
          </span>
          <span className="text-sm text-muted-foreground">
            Signed in as {signedInEmail}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!leads?.length}
            className="inline-flex h-11 items-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Name", "Email", "Phone", "City", "Subject", "Level", "Year", "Submitted"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No leads yet.
                </td>
              </tr>
            )}
            {leads?.map((l) => (
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
