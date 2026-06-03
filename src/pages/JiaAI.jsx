import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, RefreshCw } from 'lucide-react';

const SUGGESTED = [
  "What is a normal period cycle?",
  "Why do I have cramps?",
  "How do I manage PMS?",
  "What foods help during periods?",
  "Is it normal to miss a period?",
  "What is ovulation?",
  "How long should a period last?",
  "Can I exercise during my period?",
];

const JIA_SYSTEM = `You are Jia, a warm, friendly, and knowledgeable health companion for FlowCare — a period tracking app designed for school and college girls aged 13–23. 

Your personality:
- Warm, empathetic, and non-judgmental
- Uses simple, age-appropriate language
- Adds supportive emojis occasionally
- Always encourages users to talk to a trusted adult or doctor for medical concerns
- Never makes medical diagnoses
- Promotes body positivity and self-care

Your expertise covers:
- Menstrual health, cycle tracking, phases
- PMS symptoms and management
- Period hygiene and self-care
- Nutrition and exercise during the cycle
- Emotional wellness and mood changes
- When to see a doctor
- General reproductive health education (age-appropriate)

Always end serious medical questions with a gentle reminder to consult a healthcare professional. Keep responses concise (2–4 paragraphs max) and easy to read. Use bullet points when helpful.`;

export default function JiaAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **Jia** 🌸 Your FlowCare health companion. I'm here to answer your questions about periods, your cycle, moods, and general health. Everything you share stays private. What's on your mind? 💕",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Jia'}: ${m.content}`).join('\n');
    const prompt = `${JIA_SYSTEM}\n\nConversation history:\n${history}\n\nUser: ${userMsg}\n\nJia:`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't respond just now 🌸 Please check your connection and try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm **Jia** 🌸 Your FlowCare health companion. What would you like to know? 💕",
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Jia</h1>
            <p className="text-xs text-muted-foreground">Your health companion · Always here 💕</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="New chat">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 shrink-0">
          <p className="text-xs text-muted-foreground mb-2 px-1">Suggested questions</p>
          <div className="flex flex-wrap gap-2 pb-1">
            {SUGGESTED.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <span className="text-xs font-bold text-white">J</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-border rounded-tl-sm'
                }`}
              >
                {msg.content.split('\n').map((line, li) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={li} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return <li key={li} className="ml-2 list-disc list-inside">{line.slice(2)}</li>;
                  }
                  // inline bold
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={li} className={li > 0 ? 'mt-1' : ''}>
                      {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi}>{p}</strong> : p)}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">J</span>
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/50"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/80 backdrop-blur-sm shrink-0">
        <p className="text-[10px] text-muted-foreground text-center mb-2">
          Jia is not a medical professional. Always consult a doctor for medical advice.
        </p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask Jia anything about your health..."
            className="flex-1 bg-secondary/50 rounded-2xl px-4 py-3 text-sm outline-none border border-border focus:border-primary/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-2xl w-12 h-12 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}