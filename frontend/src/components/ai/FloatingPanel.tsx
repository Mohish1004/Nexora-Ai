import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Sparkles, X, Send, Bot, MessageSquare } from 'lucide-react';

export default function FloatingPanel() {
  const { activeWorkspace, user } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: `Hello ${user?.name || 'there'}! Ask me about your balances, inventory, or expenses.` }
  ]);
  const [input, setInput] = useState('');
  
  const isBusiness = activeWorkspace === 'business';
  const themeAccent = isBusiness ? 'bg-primary border-primary hover:bg-cyan-400' : 'bg-primary-emerald border-primary-emerald hover:bg-emerald-400';
  const textAccent = isBusiness ? 'text-primary' : 'text-primary-emerald';

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = "Scanning records. Try asking to 'Audit SaaS contracts' or 'Identify low stock items' to test our telemetry.";
      const lower = userText.toLowerCase();
      if (lower.includes('saas') || lower.includes('contract')) {
        reply = "SaaS audit identified ₹30,500 in redundant monthly spend. Discovered duplicate billing on Amazon Web Services and WeWork seat overlaps.";
      } else if (lower.includes('low') || lower.includes('stock')) {
        reply = "Inventory audit: 2 items currently low or out of stock (Dell XPS 15 and iPad Pro 11\"). Stock health is at 80%.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-black shadow-2xl transition-all duration-300 hover:scale-110 ${themeAccent}`}
        >
          <Sparkles size={24} className="animate-pulse" />
        </button>
      )}

      {/* Expanded Chat Overlay */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 glass-card border border-white/10 rounded-2xl flex flex-col justify-between shadow-2xl overflow-hidden animate-float-fast">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bot size={16} className={textAccent} />
              <span className="text-xs font-bold text-white font-display">Ask Nexora Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl text-[10px] leading-relaxed max-w-[85%] ${
                  m.sender === 'user'
                    ? isBusiness 
                      ? 'bg-primary/20 text-white border border-primary/20' 
                      : 'bg-primary-emerald/20 text-white border border-primary-emerald/20'
                    : 'bg-white/5 text-gray-300 border border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Form Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-3 py-2 text-[10px] glass-input"
            />
            <button
              onClick={handleSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-black font-semibold transition-all ${themeAccent}`}
            >
              <Send size={10} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
