type LeadFields = {
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  study_level: string;
  start_year: string;
};

const wrap = (inner: string, preheader?: string) => `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/>
<title>Bridge Gateway</title></head>
<body style="margin:0;background:#0b1220;color:#f5efe1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;padding:24px 0">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0"
      style="background:#11192c;border-radius:16px;overflow:hidden;border:1px solid rgba(212,175,55,0.18)">
      <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#d4af37 0%,#b78b1f 100%);color:#0b1220">
        <div style="font-family:'Instrument Serif',serif;font-size:28px;line-height:1.1">Bridge Gateway</div>
        <div style="font-size:13px;opacity:.85;margin-top:4px">UK university applications, handled with care.</div>
      </td></tr>
      <tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#f5efe1">
        ${inner}
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:#8c95a8">
        Bridge Gateway · London, United Kingdom<br/>
        <a href="https://bridgegateway.co.uk" style="color:#d4af37;text-decoration:none">bridgegateway.co.uk</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

export function leadWelcomeEmail(lead: LeadFields) {
  const inner = `
    <h1 style="font-family:'Instrument Serif',serif;font-weight:400;font-size:26px;margin:0 0 8px;color:#f5efe1">
      Hello ${escape(lead.name.split(" ")[0])},
    </h1>
    <p>Thanks for reaching out to Bridge Gateway. We've received your enquiry and one of our advisers will be in touch within one working day.</p>
    <p style="margin-top:20px"><strong style="color:#d4af37">Your details</strong></p>
    <table cellpadding="6" style="font-size:14px;color:#cfd5e3">
      <tr><td style="opacity:.7">Subject</td><td>${escape(lead.subject)}</td></tr>
      <tr><td style="opacity:.7">Level</td><td>${escape(lead.study_level)}</td></tr>
      <tr><td style="opacity:.7">Start</td><td>${escape(lead.start_year)}</td></tr>
      <tr><td style="opacity:.7">City</td><td>${escape(lead.city)}</td></tr>
    </table>
    <p style="margin-top:24px">In the meantime, you can explore our partner universities and shortlist courses inside your dashboard.</p>
    <p style="margin-top:24px">
      <a href="https://bridgegateway.co.uk/dashboard"
        style="display:inline-block;padding:12px 22px;background:#d4af37;color:#0b1220;border-radius:999px;text-decoration:none;font-weight:600">
        Open your dashboard
      </a>
    </p>`;
  return {
    subject: `We've received your enquiry, ${escape(lead.name.split(" ")[0])}`,
    html: wrap(inner, "An adviser will be in touch within one working day."),
  };
}

export function leadAdminAlertEmail(lead: LeadFields) {
  const inner = `
    <h1 style="font-family:'Instrument Serif',serif;font-weight:400;font-size:24px;margin:0 0 16px">
      New lead · ${escape(lead.name)}
    </h1>
    <table cellpadding="6" style="font-size:14px;color:#cfd5e3">
      <tr><td style="opacity:.7">Email</td><td>${escape(lead.email)}</td></tr>
      <tr><td style="opacity:.7">Phone</td><td>${escape(lead.phone)}</td></tr>
      <tr><td style="opacity:.7">City</td><td>${escape(lead.city)}</td></tr>
      <tr><td style="opacity:.7">Subject</td><td>${escape(lead.subject)}</td></tr>
      <tr><td style="opacity:.7">Level</td><td>${escape(lead.study_level)}</td></tr>
      <tr><td style="opacity:.7">Start</td><td>${escape(lead.start_year)}</td></tr>
    </table>
    <p style="margin-top:24px">
      <a href="https://bridgegateway.co.uk/admin/leads"
        style="display:inline-block;padding:12px 22px;background:#d4af37;color:#0b1220;border-radius:999px;text-decoration:none;font-weight:600">
        Open the admin inbox
      </a>
    </p>`;
  return {
    subject: `New lead · ${lead.name} · ${lead.subject}`,
    html: wrap(inner, `New enquiry from ${lead.name}`),
  };
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
