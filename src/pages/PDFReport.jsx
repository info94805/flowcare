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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;
    let pageNum = 1;

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 150, 160);
      doc.text('FlowCare — Your Cycle Companion', margin, pageHeight - 20);
      doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
    };

    // Header background
    doc.setFillColor(255, 133, 162);
    doc.rect(0, 0, pageWidth, 90, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FlowCare Health Report', margin, 40);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${report.type === 'doctor' ? '🏥 Doctor Report' : '💕 Personal Report'}`, margin, 62);
    doc.text(`Generated: ${format(parseISO(report.generatedAt), 'MMMM d, yyyy')}`, margin, 78);

    // Disclaimer box
    doc.setFillColor(255, 243, 246);
    doc.setDrawColor(220, 100, 130);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, 105, usableWidth, 28, 4, 4, 'FD');
    doc.setTextColor(160, 60, 80);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'DISCLAIMER: AI-generated for informational purposes only. This is NOT a medical diagnosis. Always consult a qualified healthcare professional.',
      margin + 8, 123, { maxWidth: usableWidth - 16 }
    );

    // Section divider
    doc.setDrawColor(255, 133, 162);
    doc.setLineWidth(1);
    doc.line(margin, 145, pageWidth - margin, 145);

    // Report content
    doc.setTextColor(40, 20, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    let y = 162;
    const lineHeight = 16;

    // Process content line by line for better formatting
    const rawLines = report.content.split('\n');

    rawLines.forEach(rawLine => {
      const trimmed = rawLine.trim();

      // Detect headings (lines ending with : or all caps or starting with #)
      const isHeading = /^#{1,3}\s/.test(trimmed) || /^[A-Z][A-Z\s\-:]{8,}$/.test(trimmed) || (/^[A-Za-z\s]+:$/.test(trimmed) && trimmed.length < 60);
      const cleanLine = trimmed.replace(/^#{1,3}\s*/, '');

      if (y + lineHeight > pageHeight - 45) {
        addFooter();
        doc.addPage();
        pageNum++;
        y = margin;
        // Re-set font after new page
        doc.setTextColor(40, 20, 30);
        doc.setFontSize(10);
      }

      if (trimmed === '') {
        y += lineHeight * 0.5;
        return;
      }

      if (isHeading) {
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(200, 60, 100);
        const wrappedHeading = doc.splitTextToSize(cleanLine, usableWidth);
        wrappedHeading.forEach(l => {
          if (y + lineHeight > pageHeight - 45) {
            addFooter();
            doc.addPage();
            pageNum++;
            y = margin;
          }
          doc.text(l, margin, y);
          y += lineHeight;
        });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 20, 30);
        y += 2;
      } else {
        const wrapped = doc.splitTextToSize(cleanLine, usableWidth);
        wrapped.forEach(l => {
          if (y + lineHeight > pageHeight - 45) {
            addFooter();
            doc.addPage();
            pageNum++;
            y = margin;
            doc.setTextColor(40, 20, 30);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
          }
          doc.text(l, margin, y);
          y += lineHeight;
        });
      }
    });

    addFooter();
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
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-lg">Report Ready!</p>
                <p className="text-xs text-muted-foreground mt-1">Your {report.type === 'doctor' ? 'doctor' : 'personal'} report has been generated successfully.</p>
              </div>
              <Button onClick={downloadPDF} className="rounded-xl font-heading font-bold gap-2 px-8">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center border-t pt-3">
              ⚠️ AI-generated for informational purposes only. Not a medical diagnosis.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}