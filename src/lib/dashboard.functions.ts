import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChecklistItem = { key: string; label: string; done: boolean; href: string };

export const getDashboardOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, shortlistRes, docsRes, appsRes, bookingsRes, eventsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("shortlists").select("id,course_id,course_name,partner,level,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
      supabase.from("documents").select("id,type").eq("user_id", userId),
      supabase.from("applications").select("id,status,created_at,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(8),
      supabase.from("bookings").select("id,starts_at,status,channel").eq("student_id", userId).order("starts_at", { ascending: false }).limit(5),
      supabase.from("application_events").select("id,application_id,type,payload,created_at").order("created_at", { ascending: false }).limit(15),
    ]);

    const profile = profileRes.data ?? null;
    const shortlist = shortlistRes.data ?? [];
    const documents = docsRes.data ?? [];
    const applications = appsRes.data ?? [];
    const bookings = bookingsRes.data ?? [];
    const events = eventsRes.data ?? [];

    const hasContact = !!(profile?.full_name && profile?.phone);
    const hasAcademic = !!(profile?.subject && profile?.study_level);
    const hasLocation = !!profile?.city;
    const hasDocs = documents.length > 0;
    const hasShortlist = shortlist.length > 0;
    const hasApp = applications.length > 0;
    const hasBooking = bookings.length > 0;

    const checklist: ChecklistItem[] = [
      { key: "contact", label: "Add contact details", done: hasContact, href: "/onboarding" },
      { key: "academic", label: "Tell us your subject & level", done: hasAcademic, href: "/onboarding" },
      { key: "location", label: "Share your preferred city", done: hasLocation, href: "/onboarding" },
      { key: "shortlist", label: "Save your first course", done: hasShortlist, href: "/courses" },
      { key: "documents", label: "Upload a document", done: hasDocs, href: "/dashboard/documents" },
      { key: "application", label: "Start an application", done: hasApp, href: "/dashboard/applications" },
      { key: "booking", label: "Book your adviser call", done: hasBooking, href: "/dashboard/bookings" },
    ];

    const completed = checklist.filter((c) => c.done).length;
    const completionPct = Math.round((completed / checklist.length) * 100);
    const nextStep = checklist.find((c) => !c.done) ?? null;

    // Recommendations: query courses by subject/level, prefer partners
    let recommendations: Array<{
      id: string;
      slug: string;
      name: string;
      level: string;
      subject: string;
      duration_months: number | null;
      fee_gbp: number | null;
      score: number;
      university: { id: string; slug: string; name: string; city: string | null; logo_url: string | null; is_partner: boolean };
    }> = [];

    if (profile?.subject || profile?.study_level) {
      let q = supabase
        .from("courses")
        .select("id,slug,name,level,subject,duration_months,fee_gbp,university_id,universities!inner(id,slug,name,city,logo_url,is_partner)")
        .eq("is_active", true)
        .limit(12);
      if (profile?.subject) q = q.eq("subject", profile.subject);
      if (profile?.study_level) q = q.eq("level", profile.study_level);
      const { data: rows } = await q;
      const shortlisted = new Set(shortlist.map((s) => s.course_id));
      recommendations = (rows ?? [])
        .filter((r) => !shortlisted.has(r.id))
        .map((r) => {
          let score = 50;
          if (profile?.subject && r.subject === profile.subject) score += 25;
          if (profile?.study_level && r.level === profile.study_level) score += 15;
          const uni = Array.isArray(r.universities) ? r.universities[0] : r.universities;
          if (uni?.is_partner) score += 10;
          if (profile?.city && uni?.city && uni.city.toLowerCase() === profile.city.toLowerCase()) score += 10;
          return {
            id: r.id,
            slug: r.slug,
            name: r.name,
            level: r.level,
            subject: r.subject,
            duration_months: r.duration_months,
            fee_gbp: r.fee_gbp,
            score: Math.min(100, score),
            university: {
              id: uni?.id ?? "",
              slug: uni?.slug ?? "",
              name: uni?.name ?? "",
              city: uni?.city ?? null,
              logo_url: uni?.logo_url ?? null,
              is_partner: !!uni?.is_partner,
            },
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }

    // Activity feed: mix application_events + bookings
    type Activity = { id: string; kind: string; title: string; at: string; href?: string };
    const activity: Activity[] = [];
    for (const e of events) {
      const payload = (e.payload ?? {}) as { note?: string };
      activity.push({
        id: `evt-${e.id}`,
        kind: e.type,
        title: payload.note ?? humanizeEvent(e.type),
        at: e.created_at,
        href: e.application_id ? `/dashboard/applications/${e.application_id}` : undefined,
      });
    }
    for (const b of bookings) {
      activity.push({
        id: `bk-${b.id}`,
        kind: "booking",
        title: `Adviser ${b.channel} call ${b.status === "confirmed" ? "confirmed" : b.status}`,
        at: b.starts_at,
        href: "/dashboard/bookings",
      });
    }
    activity.sort((a, b) => +new Date(b.at) - +new Date(a.at));

    return {
      profile,
      checklist,
      completionPct,
      completed,
      total: checklist.length,
      nextStep,
      recommendations,
      activity: activity.slice(0, 6),
      counts: {
        shortlist: shortlist.length,
        applications: applications.length,
        documents: documents.length,
        bookings: bookings.length,
      },
    };
  });

function humanizeEvent(kind: string): string {
  const map: Record<string, string> = {
    created: "Application created",
    updated: "Application updated",
    submitted: "Application submitted",
    status_changed: "Status updated",
    document_attached: "Document attached",
    note_added: "Adviser note added",
  };
  return map[kind] ?? kind.replace(/_/g, " ");
}
