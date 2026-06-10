import { Cpu, Shield, Globe, Database } from 'lucide-react';

export default function About() {
  const highlights = [
    { icon: Cpu, title: 'AI-First Architecture', desc: 'Built with React 19, Three.js, and Spring Boot — real-time AI advisory via neural OCR, ARIMA forecasts, and conversational copilot.' },
    { icon: Shield, title: 'Enterprise-Grade Security', desc: 'JWT-based auth, sandboxed dual workspaces (Business/Personal), and role-scoped data access.' },
    { icon: Globe, title: 'Unified Command Center', desc: 'One dashboard for inventory, receivables, payables, expenses, goals, and AI-driven auditing.' },
    { icon: Database, title: 'Full-Stack PostgreSQL', desc: 'Persistent relational data model with Docker Compose orchestration and RESTful Spring Boot APIs.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center">
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      <main className="w-full max-w-5xl px-6 pt-28 pb-20 z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-300 shadow-inner mb-4">
            <Cpu size={12} className="text-cyan-400" />
            <span>v1.0.0 — June 2026</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black font-display text-white">About Nexora AI</h1>
          <p className="text-gray-400 text-sm mt-4 max-w-2xl mx-auto">
            Nexora AI is a dual-workspace executive command deck built for SMEs and independent directors.
            It combines real-time business intelligence with personal financial tracking inside a glass-themed shell.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-base text-white">{h.title}</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{h.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-card p-8 rounded-2xl border border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white font-display">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['React 19', 'TypeScript', 'Tailwind v4', 'Shadcn UI', 'Three.js', 'Framer Motion', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'Zustand'].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
