import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function makeCode(seed: string) {
  // Deterministic-ish, URL-safe, short.
  const base = seed.replace(/-/g, "").slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BG-${base}${rand}`;
}

export const getOrCreateMyReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await supabaseAdmin
      .from("referrals")
      .select("id,code,status,reward_pence,created_at,converted_at,referred_user_id")
      .eq("referrer_user_id", context.userId)
      .order("created_at", { ascending: false });

    let primary = existing?.[0] ?? null;
    if (!primary) {
      let attempt = 0;
      while (attempt < 4 && !primary) {
        const code = makeCode(context.userId);
        const { data, error } = await supabaseAdmin
          .from("referrals")
          .insert({ referrer_user_id: context.userId, code, status: "pending" })
          .select("id,code,status,reward_pence,created_at,converted_at,referred_user_id")
          .maybeSingle();
        if (!error && data) {
          primary = data;
          break;
        }
        attempt += 1;
      }
      if (!primary) throw new Error("Could not generate referral code.");
    }

    const conversions = (existing ?? []).filter((r) => r.status === "converted" || r.status === "rewarded").length;
    const totalReward = (existing ?? []).reduce((a, r) => a + (r.reward_pence ?? 0), 0);

    return { primary, history: existing ?? [], conversions, totalRewardPence: totalReward };
  });

export const claimReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().trim().min(3).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const code = data.code.toUpperCase();
    const { data: ref, error } = await supabaseAdmin
      .from("referrals")
      .select("id,referrer_user_id,referred_user_id,status")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ref) throw new Error("Code not found.");
    if (ref.referrer_user_id === context.userId) throw new Error("You can't redeem your own code.");
    if (ref.referred_user_id && ref.referred_user_id !== context.userId)
      throw new Error("Code already claimed.");

    await supabaseAdmin
      .from("referrals")
      .update({ referred_user_id: context.userId, status: "signed_up" })
      .eq("id", ref.id);

    await supabaseAdmin
      .from("profiles")
      .update({ referred_by: ref.referrer_user_id })
      .eq("user_id", context.userId);

    return { ok: true };
  });
