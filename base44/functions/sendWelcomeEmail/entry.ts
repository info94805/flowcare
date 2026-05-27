import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const firstName = user.full_name?.split(' ')[0] || 'there';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to FlowCare</title>
</head>
<body style="margin:0;padding:0;background:#fff5f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(255,133,162,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF85A2,#C9A0DC);padding:40px 32px;text-align:center;">
              <p style="margin:0;font-size:40px;">🌸</p>
              <h1 style="margin:12px 0 4px;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Welcome to FlowCare</h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">Your personal health companion</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 16px;font-size:17px;color:#3d2c3e;font-weight:600;">Hi ${firstName}! 👋</p>
              <p style="margin:0 0 20px;font-size:15px;color:#6b5c6e;line-height:1.7;">
                We're so happy you've joined FlowCare! 💕 You're now part of a community that believes every girl deserves to understand her body with confidence.
              </p>

              <!-- Feature cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#fff0f4;border-radius:14px;padding:16px 18px;width:48%;">
                    <p style="margin:0 0 6px;font-size:20px;">📅</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#3d2c3e;">Cycle Tracking</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#9b7fa0;">Log periods & predict your next cycle</p>
                  </td>
                  <td style="width:4%;"></td>
                  <td style="background:#f5f0ff;border-radius:14px;padding:16px 18px;width:48%;">
                    <p style="margin:0 0 6px;font-size:20px;">✨</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#3d2c3e;">Jia AI</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#9b7fa0;">Your personal health companion</p>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:12px;"></td></tr>
                <tr>
                  <td style="background:#f0fbf5;border-radius:14px;padding:16px 18px;width:48%;">
                    <p style="margin:0 0 6px;font-size:20px;">📊</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#3d2c3e;">Insights</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#9b7fa0;">Understand your health patterns</p>
                  </td>
                  <td style="width:4%;"></td>
                  <td style="background:#fff8f0;border-radius:14px;padding:16px 18px;width:48%;">
                    <p style="margin:0 0 6px;font-size:20px;">🔔</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#3d2c3e;">Reminders</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#9b7fa0;">Never miss a pad change or water intake</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#6b5c6e;line-height:1.7;">
                Start by logging your first period and let FlowCare do the rest. 🌺 We're always here if you need any help!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://flowcare.in" style="display:inline-block;background:linear-gradient(135deg,#FF85A2,#C9A0DC);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
                      Open FlowCare 🌸
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf0f4;padding:24px 32px;text-align:center;border-top:1px solid #fde0e8;">
              <p style="margin:0 0 6px;font-size:13px;color:#b08090;">Questions? Email us at <a href="mailto:support@flowcare.in" style="color:#FF85A2;text-decoration:none;">support@flowcare.in</a></p>
              <p style="margin:0;font-size:12px;color:#c0a0ac;">Made with 💕 for every girl's health journey</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'FlowCare',
      subject: '🌸 Welcome to FlowCare — Your health journey begins!',
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});