import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, HelpCircle, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FAQS = [
  { q: 'How do I log my period?', a: 'Go to Profile → "Log New Period" and enter the start date of your period. You can also use the Log tab to record daily details.' },
  { q: 'How accurate are cycle predictions?', a: 'Predictions improve the more cycles you track. Initial predictions use your entered average cycle length. After 3+ cycles, FlowCare calculates your personal average.' },
  { q: 'How do I cancel/get a refund?', a: 'Email support@flowcare.in within 10 days of purchase for a full refund. No questions asked.' },
  { q: 'Is my data private?', a: 'Yes! Your data is private, encrypted, and never shared with third parties. Only you can see your health data.' },
  { q: 'How does Jia AI work?', a: 'Jia is an AI health companion trained on general menstrual health education. She provides informational responses only — not medical advice.' },
  { q: 'What\'s the difference between app modes?', a: 'School mode shows a simplified interface. College mode adds more features. Daily mode is the full experience with all tracking capabilities.' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!subject || !message) return;
    setSending(true);
    const user = await base44.auth.me();
    const mailtoLink = `mailto:support@flowcare.in?subject=${encodeURIComponent('[FlowCare Support] ' + subject)}&body=${encodeURIComponent('From: ' + (user?.email || '') + '\n\n' + message)}`;
    window.open(mailtoLink, '_blank');
    setSending(false);
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-5 text-foreground font-heading font-semibold">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Contact Support</h1>
      </div>

      {/* Quick contacts */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-bold">Email</p>
            <p className="text-xs text-muted-foreground">support@flowcare.in</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs font-bold">Refunds</p>
            <p className="text-xs text-muted-foreground">10-day guarantee</p>
          </div>
        </Card>
      </div>

      {/* FAQs */}
      <h2 className="font-heading font-bold mb-3">Frequently Asked Questions</h2>
      <div className="space-y-2 mb-6">
        {FAQS.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              className="w-full p-4 text-left flex items-center justify-between"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="text-sm font-semibold pr-4">{faq.q}</span>
              <span className="text-muted-foreground text-lg">{expanded === i ? '−' : '+'}</span>
            </button>
            {expanded === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Contact form */}
      <h2 className="font-heading font-bold mb-3">Send us a Message</h2>
      {sent ? (
        <Card className="p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="font-heading font-bold">Message Sent!</p>
          <p className="text-sm text-muted-foreground mt-1">We'll get back to you within 24–48 hours.</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setSent(false)}>Send Another</Button>
        </Card>
      ) : (
        <Card className="p-5 space-y-3">
          <div>
            <Label className="text-xs font-semibold">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="How can we help?" className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Message</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue or question..." className="mt-1 rounded-xl resize-none" rows={4} />
          </div>
          <Button onClick={sendMessage} disabled={!subject || !message || sending} className="w-full rounded-xl font-heading font-bold">
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </Card>
      )}
    </div>
  );
}