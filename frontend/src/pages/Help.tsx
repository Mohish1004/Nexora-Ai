import { useState } from 'react';
import { LifeBuoy, ChevronDown, ChevronUp, MessageSquare, BookOpen, Mail } from 'lucide-react';

const faqs = [
  {
    q: 'How do I switch between Business and Personal workspaces?',
    a: 'Use the workspace indicator in the sidebar (desktop) or tap the current workspace name. You can also change from the Settings page under "Workspace Settings".',
  },
  {
    q: 'Can I use both workspaces with a free account?',
    a: 'The Starter Pilot plan gives access to one workspace. Upgrade to Enterprise Nexus (₹1,999/month) to unlock dual-workspace switching and AI modules.',
  },
  {
    q: 'How does the AI Assistant work?',
    a: 'Click the floating sparkle icon (desktop) or the AI button above the bottom nav (mobile). Ask about inventory levels, SaaS contracts, receivables, or expenses. The AI scans your stored records and returns relevant insights.',
  },
  {
    q: 'What is the low-stock alert threshold?',
    a: 'Each inventory item has a configurable minimum stock level. When current stock falls below that threshold, the item is flagged as "Low Stock" and a notification is created.',
  },
  {
    q: 'How do I send payment reminders?',
    a: 'Navigate to Receivables, click the reminder icon next to any outstanding invoice. The system sends a notification and logs it in your history.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All API calls use JWT authentication. Data is stored in PostgreSQL and scoped per user. Workspaces are fully sandboxed.',
  },
];

export default function Help() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center">
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      <main className="w-full max-w-4xl px-6 pt-28 pb-20 z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-emerald-300 shadow-inner mb-4">
            <LifeBuoy size={12} className="text-emerald-400" />
            <span>Support Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black font-display text-white">Help & FAQs</h1>
          <p className="text-gray-400 text-sm mt-4 max-w-xl mx-auto">
            Find answers to common questions about Nexora AI.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                {openIdx === idx ? (
                  <ChevronUp size={16} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                )}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5">
                  <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 glass-card p-8 rounded-2xl border border-white/10 text-center">
          <h2 className="text-xl font-bold text-white font-display mb-4">Still need help?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all">
              <MessageSquare size={14} />
              Live Chat
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all">
              <BookOpen size={14} />
              Documentation
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all">
              <Mail size={14} />
              Email Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
