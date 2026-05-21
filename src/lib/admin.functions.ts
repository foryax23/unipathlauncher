import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not verify your access.");
  if (!data) throw new Error("Forbidden");
}

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const listStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    let q = supabaseAdmin
      .from("profiles")
      .select(
        "id,user_id,full_name,phone,city,country,subject,study_level,start_year,onboarding_complete,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`full_name.ilike.${s},city.ilike.${s},subject.ilike.${s}`);
    }

    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);

    // Fetch emails from auth.users via admin API
    const userIds = (profiles ?? []).map((p) => p.user_id);
    const emailMap = new Map<string, string>();
    if (userIds.length) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      for (const u of usersData?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email);
      }
    }

    return {
      students: (profiles ?? []).map((p) => ({
        ...p,
        email: emailMap.get(p.user_id) ?? null,
      })),
    };
  });

export const getStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const [{ data: profile, error: pErr }, { data: userRes }] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("user_id", data.userId)
          .maybeSingle(),
        supabaseAdmin.auth.admin.getUserById(data.userId),
      ]);
    if (pErr) throw new Error(pErr.message);

    const email = userRes?.user?.email ?? null;
    let leads: any[] = [];
    if (email) {
      const { data: leadRows } = await supabaseAdmin
        .from("leads")
        .select("*")
        .ilike("email", email)
        .order("created_at", { ascending: false });
      leads = leadRows ?? [];
    }

    return {
      profile,
      email,
      createdAt: userRes?.user?.created_at ?? null,
      lastSignInAt: userRes?.user?.last_sign_in_at ?? null,
      leads,
    };
  });
