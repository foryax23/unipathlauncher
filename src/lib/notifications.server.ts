// Server-only helper to emit in-app notifications.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type NotifyInput = {
  userId: string;
  kind: string;
  title: string;
  body?: string | null;
  link?: string | null;
};

export async function notifyUser(input: NotifyInput): Promise<void> {
  try {
    await supabaseAdmin.from("notifications").insert({
      user_id: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    });
  } catch (err) {
    console.error("notifyUser failed", err);
  }
}

export async function notifyStaff(input: Omit<NotifyInput, "userId">): Promise<void> {
  try {
    const { data: staff } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "adviser"]);
    if (!staff?.length) return;
    await supabaseAdmin.from("notifications").insert(
      staff.map((s) => ({
        user_id: s.user_id,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      })),
    );
  } catch (err) {
    console.error("notifyStaff failed", err);
  }
}
