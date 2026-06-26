import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/admin.functions";

export async function requireAdminBeforeLoad(opts: { to: string }) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw redirect({ to: "/login", search: { redirect: opts.to } });
  }
  try {
    const s = await getMyAdminStatus();
    if (!s.isAdmin) throw redirect({ to: "/dashboard" });
  } catch (err) {
    if (err && typeof err === "object" && "isRedirect" in (err as Record<string, unknown>)) throw err;
    throw redirect({ to: "/dashboard" });
  }
}
