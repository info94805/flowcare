import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, RefreshCw, Check } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <Link to="/settings"><Button variant="ghost" className="-ml-2 mb-4 font-heading"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></Link>
      <div className="flex items-center gap-3 mb-6">
        <RefreshCw className="w-6 h-6 text-green-500" />
        <h1 className="font-heading text-2xl font-bold">Refund Policy</h1>
      </div>

      <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mb-6">
        <p className="text-3xl font-heading font-bold text-green-700 mb-1">10-Day Money-Back</p>
        <p className="text-sm text-green-600">No questions asked. Your satisfaction is our priority. 💚</p>
      </Card>

      <div className="space-y-5 text-sm leading-relaxed">
        {[
          { title: 'Our Guarantee', body: 'We offer a full 10-day money-back guarantee on all FlowCare Premium subscriptions. If you are not completely satisfied within 10 days of your purchase, contact us for a full refund — no questions asked.' },
          { title: 'Eligibility', body: 'To be eligible for a refund: (1) Your refund request must be submitted within 10 days of the original purchase date. (2) You must provide your registered email address and order confirmation. (3) Each account is eligible for one refund request.' },
          { title: 'How to Request a Refund', body: 'Email us at refunds@flowcare.app with the subject "Refund Request" and include your registered email, order date, and reason for refund (optional). We will process your refund within 3–7 business days.' },
          { title: 'Processing Time', body: 'Refunds are processed within 3–7 business days. The amount will be credited back to your original payment method. Bank processing times may add 2–5 additional business days depending on your bank.' },
          { title: 'After Refund', body: 'After a refund is processed, your account will revert to the free plan. All your tracked data will remain intact — only premium features will be restricted. You may re-subscribe at any time.' },
          { title: 'Non-Refundable Situations', body: 'Refunds are not available for: (a) requests made after 10 days of purchase, (b) accounts found to have abused multiple refund requests, (c) purchases made through third-party app stores (Apple App Store / Google Play) — please use their respective refund processes.' },
          { title: 'Contact', body: 'For refund requests and billing questions: support@flowcare.in | For urgent support: support@flowcare.app' },
        ].map((s, i) => (
          <div key={i}>
            <h2 className="font-heading font-bold text-base mb-1">{s.title}</h2>
            <p className="text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <Card className="p-4 mt-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2">
          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Quick summary:</span> Buy today, try for 10 days. Not happy? Email us, get a full refund. Simple as that. 🌸
          </p>
        </div>
      </Card>
    </div>
  );
}