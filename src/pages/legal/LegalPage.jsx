import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <Link to="/settings"><Button variant="ghost" className="-ml-2 mb-4 font-heading"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></Link>
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <h1 className="font-heading text-2xl font-bold">Legal & Disclaimer</h1>
      </div>
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
        <p className="text-sm font-bold text-amber-800">⚠️ Important Medical Disclaimer</p>
        <p className="text-xs text-amber-700 mt-1">FlowCare is NOT a medical device and does NOT provide medical advice.</p>
      </div>
      <div className="space-y-5 text-sm leading-relaxed">
        {[
          { title: 'Medical Disclaimer', body: 'FlowCare is a personal wellness and period tracking application intended for informational and educational purposes only. The information provided through this App, including cycle predictions, AI responses from Jia, educational articles, and health insights, does NOT constitute medical advice and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment.' },
          { title: 'Accuracy of Predictions', body: 'Cycle predictions are estimates based on averages and user-entered data. Individual cycles vary significantly. Predictions are not 100% accurate and should not be used for contraception, family planning, or medical decision-making without consulting a healthcare professional.' },
          { title: 'AI Assistant (Jia)', body: 'Jia is an AI-powered chatbot trained on general health education content. Jia is NOT a doctor, nurse, or licensed healthcare provider. Responses are for general educational awareness only. Always consult a qualified medical professional for health concerns.' },
          { title: 'Emergency Situations', body: 'If you are experiencing a medical emergency, severe symptoms, or mental health crisis, please contact emergency services (112 in India, 911 in the US) or visit your nearest hospital immediately. Do not rely on this App in emergencies.' },
          { title: 'Limitation of Liability', body: 'FlowCare and its creators are not liable for any health outcomes, decisions, or actions taken based on information provided by this App. Users assume full responsibility for their health decisions. Our maximum liability is limited to the amount paid for the App subscription.' },
          { title: 'Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.' },
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