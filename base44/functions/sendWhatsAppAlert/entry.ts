import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { numbers, message } = await req.json();

    if (!numbers || numbers.length === 0) {
      return Response.json({ error: 'No numbers provided' }, { status: 400 });
    }

    const userName = user.full_name || 'Your family member';
    const alertMsg = message || `🌺 Hi! ${userName} has started her period today. She may need some extra care and support. Sent via FlowCare app. 💕`;

    // Generate WhatsApp links for each number
    const results = numbers.map(num => {
      const cleaned = num.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      const encoded = encodeURIComponent(alertMsg);
      const waLink = `https://wa.me/${cleaned.replace('+', '')}?text=${encoded}`;
      return { number: cleaned, link: waLink };
    });

    return Response.json({ 
      success: true, 
      links: results,
      message: 'WhatsApp links generated. Tap each link to send the message.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});