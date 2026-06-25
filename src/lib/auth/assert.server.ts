// Server-only authorization helpers. Never import from a client-reachable module at top level.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function assertAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not verify your access.");
  if (!data) throw new Error("Forbidden");
}

export async function assertStaff(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "adviser"])
    .maybeSingle();
  if (error) throw new Error("Could not verify your access.");
  if (!data) throw new Error("Forbidden");
}

export async function getRole(
  userId: string,
): Promise<"admin" | "adviser" | null> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "adviser"])
    .order("role", { ascending: true }) // admin < adviser
    .limit(1)
    .maybeSingle();
  return (data?.role as "admin" | "adviser" | null) ?? null;
}
