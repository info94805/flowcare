import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Where support tickets are delivered. Defaults to the support inbox.
    const SUPPORT_INBOX = Deno.env.get('SUPPORT_INBOX') || 'support@flowcare.in';
    const safeMessage = message.replace(/\n/g, '<br/>');

    const sendEmail = (payload: Record<string, unknown>) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

    // 1) Deliver the actual support ticket to the team (this is the important one).
    const ticketRes = await sendEmail({
      from: 'FlowCare Support <support@flowcare.in>',
      to: [SUPPORT_INBOX],
      reply_to: user.email,
      subject: `[Support] ${subject} — from ${user.full_name || user.email}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#ff6b9d">New support request 🌸</h2>
          <p><strong>From:</strong> ${user.full_name || 'Unknown'} (${user.email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border:1px solid #eee"/>
          <p style="background:#fdf2f8;padding:12px;border-radius:8px">${safeMessage}</p>
        </div>
      `,
    });

    if (!ticketRes.ok) {
      const err = await ticketRes.json();
      console.error('Resend error (ticket):', JSON.stringify(err));
      return Response.json({ error: 'Email delivery failed. Please email support@flowcare.in directly.', details: err }, { status: 500 });
    }

    // 2) Send a confirmation to the user (best-effort — don't fail the request if this bounces).
    try {
      await sendEmail({
        from: 'FlowCare Support <support@flowcare.in>',
        to: [user.email],
        reply_to: 'support@flowcare.in',
        subject: `[FlowCare] We got your message: ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#ff6b9d">FlowCare Support 💕</h2>
            <p>Hi ${user.full_name || 'there'},</p>
            <p>We received your message and will get back to you within 24–48 hours.</p>
            <hr style="border:1px solid #eee"/>
            <p><strong>Your message:</strong></p>
            <p style="background:#fdf2f8;padding:12px;border-radius:8px">${safeMessage}</p>
            <hr style="border:1px solid #eee"/>
            <p style="color:#888;font-size:12px">FlowCare — Your period & wellness companion 🌸</p>
          </div>
        `,
      });
    } catch (confirmErr) {
      console.error('Confirmation email failed (non-fatal):', confirmErr);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Support email error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});