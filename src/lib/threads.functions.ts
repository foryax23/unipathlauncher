import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .or(`student_id.eq.${userId},adviser_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { threads: data ?? [] };
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: thread, error: te }, { data: messages, error: me }] = await Promise.all([
      supabase.from("threads").select("*").eq("id", data.id).maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("thread_id", data.id)
        .order("created_at"),
    ]);
    if (te) throw new Error(te.message);
    if (me) throw new Error(me.message);
    return { thread, messages: messages ?? [] };
  });

export const startThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        subject: z.string().trim().max(160).optional(),
        body: z.string().trim().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: thread, error: te } = await supabase
      .from("threads")
      .insert({
        student_id: userId,
        subject: data.subject ?? null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    if (te) throw new Error(te.message);
    if (!thread) throw new Error("Could not create thread");

    const { error: pe } = await supabase.from("messages").insert({
      thread_id: thread.id,
      sender_id: userId,
      body: data.body,
    });
    if (pe) throw new Error(pe.message);
    return { thread };
  });

export const postMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        thread_id: z.string().uuid(),
        body: z.string().trim().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msg, error } = await supabase
      .from("messages")
      .insert({ thread_id: data.thread_id, sender_id: userId, body: data.body })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    await supabase
      .from("threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", data.thread_id);
    return { message: msg };
  });

export const markThreadRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ thread_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", data.thread_id)
      .is("read_at", null)
      .neq("sender_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
