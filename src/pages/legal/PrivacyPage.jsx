import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <Link to="/settings"><Button variant="ghost" className="-ml-2 mb-4 font-heading"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></Link>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Privacy Policy</h1>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground text-xs">Last updated: May 2025</p>
        {[
          { title: '1. Information We Collect', body: 'FlowCare collects only the information you choose to provide: your email address, cycle data (period dates, length), daily logs (mood, symptoms, notes), and optional profile photo. We do not collect any sensitive medical diagnoses.' },
          { title: '2. How We Use Your Information', body: 'Your data is used exclusively to provide cycle tracking, predictions, insights, and reminders within the app. We do not sell, share, or monetize your personal health data to any third party, advertiser, or analytics service.' },
          { title: '3. Data Storage & Security', body: 'All data is stored securely with encryption at rest and in transit. Your health data is stored under your unique user account and is never publicly accessible. We use industry-standard security measures.' },
          { title: '4. WhatsApp Alerts', body: 'If you choose to enable WhatsApp family alerts, only your period start dates are shared as a notification via the WhatsApp API. No other health data is transmitted. You can remove family numbers at any time from Settings.' },
          { title: '5. Children & Minors', body: 'FlowCare is designed for users aged 13 and above. Users under 18 are encouraged to use the app with parental awareness. We comply with applicable laws regarding minors\' data protection.' },
          { title: '6. Data Deletion', body: 'You may request complete deletion of your account and all associated data at any time by contacting support@flowcare.app. All data will be permanently deleted within 30 days of your request.' },
          { title: '7. Third-Party Services', body: 'FlowCare uses secure cloud infrastructure. We do not integrate with third-party advertising networks. Any AI features process queries without storing personally identifiable information beyond your session.' },
          { title: '8. Contact Us', body: 'For privacy concerns, contact us at Support@flowcare.in or use the Contact Support option in settings.' },
        ].map((s, i) => (
          <div key={i}>
            <h2 className="font-heading font-bold text-base mb-1">{s.title}</h2>
            <p className="text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}