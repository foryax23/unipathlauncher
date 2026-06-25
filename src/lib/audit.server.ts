// Server-only helper. Never import from a client-reachable module at top level.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuditEntry = {
  actorId: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  ip?: string | null;
};

export async function logAudit(entry: AuditEntry) {
  try {
    await supabaseAdmin.from("admin_audit").insert({
      actor_id: entry.actorId,
      actor_email: entry.actorEmail ?? null,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      payload: (entry.payload ?? null) as never,
      ip: entry.ip ?? null,
    });
  } catch (err) {
    // Audit logging must never break the calling operation.
    console.error("audit log failed", err);
  }
}
