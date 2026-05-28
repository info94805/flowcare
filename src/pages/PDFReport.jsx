import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getAverageCycleLength, MOODS, SYMPTOMS_LIST } from '@/lib/cycleUtils';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';

export default function PDFReport() {
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('self');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: cycleLogs = [] } = useQuery({ queryKey: ['cycleLogs'], queryFn: () => base44.entities.CycleLog.list('-start_date', 12) });
  const { data: dailyLogs = [] } = useQuery({ queryKey: ['allDailyLogs'], queryFn: () => base44.entities.DailyLog.list('-date', 90) });

  const avgCycle = getAverageCycleLength(cycleLogs);

  const symptomCounts = {};
  dailyLogs.forEach(l => (l.symptoms || []).forEach(s => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; }));
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, count]) => `${SYMPTOMS_LIST.find(s => s.id === id)?.label || id} (${count}x)`).join(', ');

  const moodCounts = {};
  dailyLogs.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const topMoodLabel = topMood ? (MOODS.find(m => m.id === topMood[0])?.label || topMood[0]) : 'N/A';

  const generateReport = async () => {
    setGenerating(true);
    setReport(null);
    setError(null);

    const prompt = reportType === 'doctor'
      ? `Generate a detailed, professional menstrual health report suitable for a doctor consultation. Include:
         - Patient summary (do not use real name, use "Patient")
         - Cycle analysis: average cycle length ${avgCycle} days, ${cycleLogs.length} cycles tracked
         - Most common symptoms: ${topSymptoms || 'None logged'}
         - Most common mood: ${topMoodLabel}
         - Recent cycle dates: ${cycleLogs.slice(0, 4).map(c => c.start_date).join(', ')}
         - Health observations and patterns
         - Questions to ask the doctor
         - Recommendations
         Write in clear medical note format. Include a disclaimer that this is AI-generated from a wellness app, not a clinical assessment.`
      : `Generate a warm, personal menstrual health summary report for a young woman aged 13-23. Include:
         - A friendly welcome and summary of her tracking
         - Cycle stats: average ${avgCycle} days, ${cycleLogs.length} cycles tracked
         - Top symptoms: ${topSymptoms || 'Nothing major logged — great!'}
         - Mood patterns: Most frequent mood is ${topMoodLabel}
         - Wellness insights and patterns noticed
         - Personalized self-care tips based on her data
         - Encouragement and positive affirmations
         Keep it warm, supportive, age-appropriate, and empowering. Use some emojis. End with a reminder to see a doctor if she has concerns.`;

    try {
      const content = await base44.integrations.Core.InvokeLLM({ prompt });
      if (!content || typeof content !== 'string') {
        setError('Report generation failed. Please try again.');
      } else {
        setReport({ content, generatedAt: new Date().toISOString(), type: reportType });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setGenerating(false);
  };

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;

    // Header background
    doc.setFillColor(255, 133, 162);
    doc.rect(0, 0, pageWidth, 80, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FlowCare Health Report', margin, 35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${report.type === 'doctor' ? 'Doctor Report' : 'Personal Report'} • Generated: ${format(parseISO(report.generatedAt), 'MMMM d, yyyy')}`, margin, 58);

    // Disclaimer box
    doc.setFillColor(255, 243, 246);
    doc.setDrawColor(255, 133, 162);
    doc.roundedRect(margin, 95, usableWidth, 36, 6, 6, 'FD');
    doc.setTextColor(180, 60, 90);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('⚠ AI-generated for informational purposes only. This is NOT a medical diagnosis. Consult a qualified healthcare professional.', margin + 10, 117, { maxWidth: usableWidth - 20 });

    // Report content
    doc.setTextColor(50, 30, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(report.content, usableWidth);
    let y = 150;
    const lineHeight = 15;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach(line => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(180, 150, 160);
    doc.text('FlowCare — Your Cycle Companion', margin, pageHeight - 25);
    doc.text(`Page 1`, pageWidth - margin - 30, pageHeight - 25);

    doc.save(`flowcare-${report.type}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="px-5 pt-6 pb-10 space-y-5">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">AI Health Report</h1>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'self', label: 'Personal Report', emoji: '💕', desc: 'Warm summary for yourself' },
          { id: 'doctor', label: 'Doctor Report', emoji: '🏥', desc: 'Clinical format for your doctor' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${reportType === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
          >
            <span className="text-2xl">{t.emoji}</span>
            <p className="font-heading font-bold text-sm mt-1">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Data summary */}
      <Card className="p-4 bg-secondary/30">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Report will include</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p>📅 {cycleLogs.length} cycles tracked</p>
          <p>📊 Avg {avgCycle}-day cycle</p>
          <p>😊 Top mood: {topMoodLabel}</p>
          <p>🩺 {Object.keys(symptomCounts).length} symptoms logged</p>
        </div>
      </Card>

      <Button
        onClick={generateReport}
        disabled={generating}
        className="w-full rounded-xl font-heading font-bold py-6 text-base"
      >
        {generating ? (
          <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Generating your report...</span>
        ) : (
          <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Generate {reportType === 'doctor' ? 'Doctor' : 'Personal'} Report</span>
        )}
      </Button>
      {generating && <p className="text-xs text-center text-muted-foreground">This takes about 15–20 seconds. Our AI is carefully reviewing your data 💕</p>}

      {/* Error */}
      {error && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Generated report */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="font-heading font-bold">Report Ready!</p>
              </div>
              <Button size="sm" onClick={downloadPDF} className="rounded-xl font-heading gap-1">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-body leading-relaxed">{report.content}</pre>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              ⚠️ AI-generated for informational purposes only. Not a medical diagnosis.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}