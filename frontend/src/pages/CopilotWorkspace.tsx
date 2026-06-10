import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { Sparkles, Send, Paperclip, Mic, Bot, User, Table, FileWarning } from 'lucide-react';
import { mockApi } from '../services/mockApi';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  widgetType?: 'saas_audit' | 'inventory_forecast' | 'outstanding_reminders';
}

export default function CopilotWorkspace() {
  const { activeWorkspace } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Greetings. I am the Nexora AI Financial Analyst. Select one of the pre-mapped directives below or insert a custom telemetry request.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBusiness = activeWorkspace === 'business';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiMsgText = "I have scanned the logs, but I couldn't resolve specific records matching that request. Try auditing SaaS contracts or forecasting inventory.";
      let widgetType: Message['widgetType'] = undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('saas') || lower.includes('contract') || lower.includes('audit')) {
        aiMsgText = "Audit complete. I identified 3 distinct operational cost leaks on software licenses totaling ₹30,500/month in potential savings:";
        widgetType = 'saas_audit';
      } else if (lower.includes('low') || lower.includes('stock') || lower.includes('forecast')) {
        aiMsgText = "Here is the 90-day ARIMA supply forecast for active low-stock inventory items:";
        widgetType = 'inventory_forecast';
      } else if (lower.includes('reminder') || lower.includes('pay') || lower.includes('customer')) {
        aiMsgText = "Receivables sweep complete. Here are the customers currently holding overdue accounts:";
        widgetType = 'outstanding_reminders';
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widgetType
      }]);
      setLoading(false);
    }, 1500);
  };

  const suggestedPrompts = isBusiness ? [
    'Audit SaaS contracts for cost optimization',
    'Which items are currently low in stock?',
    'Show outstanding client receivables',
  ] : [
    'How can I optimize my Swiggy expenses?',
    'Give me my weekly outflow analysis',
    'Am I on track for New Creator Setup goal?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-between animate-float-slow">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white font-display">AI Copilot Workspace</h2>
          <p className="text-xs text-gray-400 mt-1">Direct query terminal linked to active inventory and treasury logs.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 flex items-center gap-1.5 animate-pulse">
          <Sparkles size={12} />
          <span>Analyst Engine v2.0</span>
        </span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 glass-card border border-white/10 rounded-2xl p-6 overflow-y-auto space-y-6 max-h-[55vh]">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-4 items-start ${!isAi ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isAi 
                  ? 'bg-violet-600/10 border-violet-500/20 text-violet-400' 
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                {isAi ? <Bot size={16} /> : <User size={16} />}
              </div>

              {/* Text Balloon */}
              <div className="space-y-3 max-w-[70%]">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isAi 
                    ? 'bg-white/[0.02] border border-white/5 text-gray-300' 
                    : isBusiness 
                      ? 'bg-primary/10 border border-primary/20 text-white' 
                      : 'bg-primary-emerald/10 border border-primary-emerald/20 text-white'
                }`}>
                  <p>{msg.text}</p>

                  {/* CUSTOM RENDERED WIDGETS IN MESSAGE BODY */}
                  {msg.widgetType === 'saas_audit' && (
                    <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-background/50 divide-y divide-white/5">
                      <div className="p-3 bg-white/[0.02] text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Table size={12} className="text-violet-400" />
                        <span>SaaS License Audit Results</span>
                      </div>
                      <div className="p-3 text-[10px] space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">1. AWS Duplicate Billing</span>
                          <span className="text-red-400 font-bold">Save ₹18,000/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">2. Unused Figma Seats (5 units)</span>
                          <span className="text-amber-400 font-bold">Save ₹8,500/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">3. Zoom Premium Overlap</span>
                          <span className="text-emerald-400 font-bold">Save ₹4,000/mo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.widgetType === 'inventory_forecast' && (
                    <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-background/50 divide-y divide-white/5">
                      <div className="p-3 bg-white/[0.02] text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileWarning size={12} className="text-cyan-400" />
                        <span>ARIMA stock risk alert</span>
                      </div>
                      <div className="p-3 text-[10px] space-y-2">
                        <div className="flex justify-between text-amber-400 font-bold">
                          <span>Dell XPS 15 (SKU: LAP-DEL-02)</span>
                          <span>Stock: 3 units (Crit: 5)</span>
                        </div>
                        <p className="text-[9px] text-gray-400 italic">Projected stock depletion date: 6 days (June 16, 2026)</p>
                      </div>
                    </div>
                  )}

                  {msg.widgetType === 'outstanding_reminders' && (
                    <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-background/50 divide-y divide-white/5">
                      <div className="p-3 bg-white/[0.02] text-[10px] font-bold text-white uppercase tracking-wider">
                        Pending Customer Receivables
                      </div>
                      <div className="p-3 text-[10px] space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">TechCorp Solutions</span>
                          <span className="text-red-400 font-bold">₹28,000 (Due 2d)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">GrowthScale Inc.</span>
                          <span className="text-amber-400 font-bold">₹18,000 (Due 4d)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-[8px] text-gray-500 block ${!isAi ? 'text-right' : ''}`}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-4 items-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="space-y-1">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-gray-500 italic">
                Nexora thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 mt-4">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-2 text-[10px] rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 transition-all font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Instruct Nexora Copilot (e.g. Run audit)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="w-full pl-4 pr-12 py-3.5 text-xs glass-input"
          />
          <div className="absolute right-3.5 top-3.5 flex gap-2">
            <button className="text-gray-500 hover:text-white" title="Attach statement/PDF">
              <Paperclip size={14} />
            </button>
            <button className="text-gray-500 hover:text-white" title="Voice directive">
              <Mic size={14} />
            </button>
          </div>
        </div>
        <button
          onClick={() => handleSend(input)}
          className={`px-5 rounded-xl flex items-center justify-center text-black font-semibold transition-all ${
            isBusiness ? 'bg-primary hover:bg-cyan-400' : 'bg-primary-emerald hover:bg-emerald-400'
          }`}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
