// Server-only email send wrapper. Calls Resend through the Lovable connector gateway.
// Becomes a no-op if the Resend connector hasn't been linked (no RESEND_API_KEY).

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
};

const DEFAULT_FROM =
  process.env.EMAIL_FROM ??
  "Bridge Gateway <onboarding@resend.dev>";

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; reason?: string }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    // Connector not linked yet — silently skip so app flow isn't blocked.
    return { ok: false, reason: "email_not_configured" };
  }
  try {
    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: payload.from ?? DEFAULT_FROM,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.reply_to,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("resend send failed", res.status, text);
      return { ok: false, reason: `http_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("resend send threw", err);
    return { ok: false, reason: "exception" };
  }
}
