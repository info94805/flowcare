import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <Link to="/settings"><Button variant="ghost" className="-ml-2 mb-4 font-heading"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></Link>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Terms & Conditions</h1>
      </div>
      <div className="space-y-5 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Last updated: May 2025 | Effective immediately upon registration</p>
        {[
          { title: '1. Acceptance of Terms', body: 'By creating an account and using FlowCare ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App.' },
          { title: '2. Eligibility', body: 'FlowCare is available to users aged 13 and above. Users between ages 13–17 should have parental awareness. By using the App, you confirm you meet the minimum age requirement.' },
          { title: '3. Account Responsibility', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your account with others and to notify us immediately of any unauthorized use.' },
          { title: '4. Subscription & Payment', body: 'FlowCare Premium is available at ₹399 (India) or $7 USD (all other countries) as a one-time lifetime payment. Payments are processed securely. Subscription activates immediately upon successful payment.' },
          { title: '5. Not Medical Advice', body: 'FlowCare is a wellness tracking tool and is NOT a medical device or service. Information provided, including AI assistant Jia, is for educational and informational purposes only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.' },
          { title: '6. Prohibited Uses', body: 'You may not use FlowCare to: (a) provide false information, (b) attempt to reverse engineer the App, (c) use the App for any unlawful purpose, (d) upload inappropriate or harmful content.' },
          { title: '7. Intellectual Property', body: 'All content, design, features, and functionality of FlowCare are owned by FlowCare and protected by intellectual property laws. You may not reproduce or distribute any part of the App without written permission.' },
          { title: '8. Termination', body: 'We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time through the app settings or by contacting support.' },
          { title: '9. Changes to Terms', body: 'We may update these Terms periodically. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify users of significant changes.' },
          { title: '10. Contact', body: 'Questions about these Terms? Contact us at legal@flowcare.app' },
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