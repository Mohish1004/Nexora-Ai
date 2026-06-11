import { useState } from 'react';
import { Mail, MapPin, Send, ArrowLeft, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center">
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      <main className="w-full max-w-5xl px-6 pt-28 pb-20 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-8 transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-emerald-300 shadow-inner mb-4">
            <Mail size={12} className="text-emerald-400" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black font-display text-white">Contact Us</h1>
          <p className="text-gray-400 text-sm mt-4 max-w-xl mx-auto">
            Have a question, feedback, or need help? We're here for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="glass-card p-8 rounded-2xl border border-white/10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Send size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-2">Message Sent!</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-white font-display mb-2">Send a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs glass-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs glass-input"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs glass-input"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs glass-input resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h2 className="text-lg font-bold text-white font-display mb-4">Other Ways to Reach Us</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Email</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">support@nexora.ai</p>
                    <p className="text-[11px] text-gray-500">We reply within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Live Chat</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Available in the app dashboard</p>
                    <p className="text-[11px] text-gray-500">Click the sparkle icon</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Location</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Nexora Labs</p>
                    <p className="text-[11px] text-gray-500">Bangalore, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Response Time</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Typically within 24 hours</p>
                    <p className="text-[11px] text-gray-500">Mon–Fri, 9 AM – 6 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                For urgent issues, please use the <strong className="text-white">Live Chat</strong> feature in your dashboard or email us directly at <strong className="text-emerald-300">support@nexora.ai</strong> with "URGENT" in the subject line.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
