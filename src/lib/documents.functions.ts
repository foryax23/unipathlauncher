import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DOC_TYPES = [
  "passport",
  "transcript",
  "english_test",
  "personal_statement",
  "reference",
  "other",
] as const;

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { documents: data ?? [] };
  });

export const requestUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        type: z.enum(DOC_TYPES),
        original_name: z.string().trim().min(1).max(200),
        size_bytes: z.number().int().min(1).max(25 * 1024 * 1024),
        mime_type: z.string().trim().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = data.original_name.replace(/[^\w.\-]/g, "_");
    const path = `${userId}/${data.type}/${Date.now()}-${safe}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("student-documents")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Could not create upload");
    return {
      path,
      token: signed.token,
      signedUrl: signed.signedUrl,
    };
  });

export const confirmDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        type: z.enum(DOC_TYPES),
        storage_path: z.string().trim().min(1).max(500),
        original_name: z.string().trim().min(1).max(200),
        size_bytes: z.number().int().min(1),
        mime_type: z.string().trim().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Owner check: path must start with the user's id
    if (!data.storage_path.startsWith(`${userId}/`)) {
      throw new Error("Invalid path");
    }
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        type: data.type,
        storage_path: data.storage_path,
        original_name: data.original_name,
        size_bytes: data.size_bytes,
        mime_type: data.mime_type ?? null,
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { document: row };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error: ge } = await supabase
      .from("documents")
      .select("storage_path,user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (ge) throw new Error(ge.message);
    if (!doc || doc.user_id !== userId) throw new Error("Not found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("student-documents").remove([doc.storage_path]);
    const { error: de } = await supabase.from("documents").delete().eq("id", data.id);
    if (de) throw new Error(de.message);
    return { ok: true as const };
  });

export const getDocumentDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: doc, error } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) throw new Error("Not found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: se } = await supabaseAdmin.storage
      .from("student-documents")
      .createSignedUrl(doc.storage_path, 60 * 10);
    if (se || !signed) throw new Error(se?.message ?? "Could not sign URL");
    return { url: signed.signedUrl };
  });
