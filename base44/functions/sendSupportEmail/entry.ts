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

    // Send confirmation to the app user (using verified resend domain)
    const confirmRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
            <p style="background:#fdf2f8;padding:12px;border-radius:8px">${message.replace(/\n/g, '<br/>')}</p>
            <hr style="border:1px solid #eee"/>
            <p style="color:#888;font-size:12px">FlowCare — Your period & wellness companion 🌸</p>
          </div>
        `,
      }),
    });

    if (!confirmRes.ok) {
      const err = await confirmRes.json();
      console.error('Resend error:', JSON.stringify(err));
      return Response.json({ error: 'Email delivery failed. Please email support@flowcare.in directly.', details: err }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Support email error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});