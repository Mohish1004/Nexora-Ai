import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Sparkles, X, Send, Bot, MessageSquare } from 'lucide-react';

function fuzzyMatch(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  return patterns.some(p => {
    const words = p.toLowerCase().split(/\s+/);
    return words.every(w => lower.includes(w));
  });
}

function detectIntent(text: string): string {
  const lower = text.toLowerCase().trim();
  if (/^(hi|hello|hey|yo|sup|howdy)\b/.test(lower)) return 'greeting';
  if (/\b(thanks|thank|ty|appreciate)\b/.test(lower)) return 'thanks';
  if (fuzzyMatch(text, ['inventory value', 'stock worth', 'total inventory', 'product value'])) return 'inventory_value';
  if (fuzzyMatch(text, ['low stock', 'out of stock', 'stock alert', 'whats low'])) return 'low_stock';
  if (fuzzyMatch(text, ['receivable', 'outstanding', 'whats owed', 'customer owes', 'money coming'])) return 'receivables';
  if (fuzzyMatch(text, ['payable', 'what i owe', 'vendor payment', 'bill due', 'money outgoing'])) return 'payables';
  if (fuzzyMatch(text, ['expense', 'spending', 'i spent', 'where money go'])) return 'expenses';
  if (fuzzyMatch(text, ['saas', 'contract', 'subscription', 'recurring'])) return 'saas_audit';
  if (fuzzyMatch(text, ['forecast', 'projection', 'predict', 'trend', 'future'])) return 'forecast';
  if (fuzzyMatch(text, ['balance', 'net worth', 'current balance', 'total money', 'how much i have'])) return 'balance';
  if (fuzzyMatch(text, ['goal', 'saving', 'target', 'save money'])) return 'goals';
  if (fuzzyMatch(text, ['customer', 'vendor', 'client', 'supplier'])) return 'contacts';
  return 'unknown';
}

export default function FloatingPanel() {
  const { activeWorkspace, user, inventory, receivables, payables, expenses, goals } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: `Hello ${user?.name || 'there'}! Ask me about your ${activeWorkspace === 'business' ? 'inventory, receivables, or payables' : 'expenses, balance, or goals'}.` }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const isBusiness = activeWorkspace === 'business';
  const themeAccent = isBusiness ? 'bg-primary border-primary hover:bg-cyan-400' : 'bg-primary-emerald border-primary-emerald hover:bg-emerald-400';
  const textAccent = isBusiness ? 'text-primary' : 'text-primary-emerald';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      const intent = detectIntent(userText);
      let reply = '';

      if (intent === 'greeting') {
        reply = `Hey ${user?.name || 'there'}! ${isBusiness ? 'Your business' : 'Your personal'} workspace is loaded and ready. What would you like to review?`;
      } else if (intent === 'thanks') {
        reply = `You're welcome, ${user?.name || 'boss'}! Anything else I can help with?`;
      } else if (intent === 'inventory_value') {
        if (!isBusiness) { reply = "Inventory tracking is available in the Business workspace. Switch over to check stock levels."; }
        else {
          const total = inventory.reduce((s, p) => s + p.purchasePrice * p.stock, 0);
          const count = inventory.length;
          reply = count === 0
            ? "Your inventory is empty. Add products in the Inventory section to start tracking stock value."
            : `Total inventory value is ₹${total.toLocaleString()} across ${count} product${count > 1 ? 's' : ''}.`;
        }
      } else if (intent === 'low_stock') {
        if (!isBusiness) { reply = "Stock alerts are available in the Business workspace."; }
        else {
          const low = inventory.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
          reply = low.length === 0
            ? "All items are well-stocked — no low-stock alerts right now."
            : `${low.length} item${low.length > 1 ? 's' : ''} need attention: ${low.map(p => `${p.name} (${p.stock} left)`).join(', ')}.`;
        }
      } else if (intent === 'receivables') {
        if (!isBusiness) { reply = "Receivables tracking is available in the Business workspace."; }
        else {
          const total = receivables.reduce((s, r) => s + r.amount, 0);
          const urgent = receivables.filter(r => r.status === 'urgent').length;
          reply = total === 0
            ? "No outstanding receivables. You're all caught up!"
            : `Total receivables: ₹${total.toLocaleString()} with ${urgent} urgent item${urgent > 1 ? 's' : ''}.`;
        }
      } else if (intent === 'payables') {
        if (!isBusiness) { reply = "Payables tracking is available in the Business workspace."; }
        else {
          const total = payables.reduce((s, p) => s + p.amount, 0);
          reply = total === 0
            ? "No pending payables. Everything is settled."
            : `Total payables: ₹${total.toLocaleString()} across ${payables.length} bill${payables.length > 1 ? 's' : ''}.`;
        }
      } else if (intent === 'expenses') {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        const cats = [...new Set(expenses.map(e => e.category))];
        reply = total === 0
          ? `No expenses logged yet in the ${isBusiness ? 'Business' : 'Personal'} workspace.`
          : `Total expenses: ₹${total.toLocaleString()} across ${cats.length} categor${cats.length > 1 ? 'ies' : 'y'}: ${cats.join(', ')}.`;
      } else if (intent === 'saas_audit') {
        if (!isBusiness) { reply = "SaaS audit is a Business workspace feature."; }
        else {
          reply = inventory.length > 0
            ? `Quick audit: ${inventory.length} product types in inventory. Use the Reports section for a full subscription analysis.`
            : "No products in inventory to audit. Add items in the Inventory section first.";
        }
      } else if (intent === 'balance') {
        const income = expenses.reduce((s, e) => s + e.amount, 0);
        reply = `Current ${isBusiness ? 'business' : 'personal'} balance insight: ${expenses.length} transactions logged totaling ₹${income.toLocaleString()}.`;
      } else if (intent === 'goals') {
        if (isBusiness) { reply = "Goal tracking is available in the Personal workspace."; }
        else {
          reply = goals.length === 0
            ? "No savings goals set yet. Create one in the Savings & Goals section."
            : `You have ${goals.length} goal${goals.length > 1 ? 's' : ''}: ${goals.map(g => `${g.title} (₹${g.currentAmount.toLocaleString()}/₹${g.targetAmount.toLocaleString()})`).join(', ')}.`;
        }
      } else {
        reply = `I couldn't resolve that query from your ${isBusiness ? 'Business' : 'Personal'} records. Try asking about inventory, receivables, payables${isBusiness ? '' : ', expenses, goals'} or say "hello".`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
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
