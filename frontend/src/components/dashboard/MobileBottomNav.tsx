import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import {
  LayoutDashboard,
  Package,
  ArrowUpRight,
  Receipt,
  Target,
  BarChart3,
  Sparkles,
  MoreHorizontal,
  Bot,
  X,
  Send,
  ArrowDownLeft,
  Briefcase,
  User,
  Cpu,
} from 'lucide-react';
import { useState } from 'react';

const businessPrimary = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Copilot', path: '/copilot', icon: Cpu },
  { name: 'Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Profile', path: '/profile', icon: User },
];

const personalPrimary = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Copilot', path: '/copilot', icon: Cpu },
  { name: 'Analytics', path: '/personal-reports', icon: BarChart3 },
  { name: 'Profile', path: '/profile', icon: User },
];

const businessMore = [
  { name: 'Receivables', path: '/receivables', icon: ArrowUpRight },
  { name: 'Payables', path: '/payables', icon: ArrowDownLeft },
  { name: 'Customers', path: '/customers', icon: Briefcase },
];

const personalMore = [
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Goals', path: '/goals', icon: Target },
];

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
  if (fuzzyMatch(text, ['balance', 'net worth', 'current balance', 'total money', 'how much i have'])) return 'balance';
  if (fuzzyMatch(text, ['goal', 'saving', 'target', 'save money'])) return 'goals';
  if (fuzzyMatch(text, ['saas', 'contract', 'subscription', 'recurring'])) return 'saas_audit';
  if (fuzzyMatch(text, ['optimize', 'reduce cost', 'save money', 'cut expense', 'spend less'])) return 'optimize';
  if (fuzzyMatch(text, ['forecast', 'projection', 'predict', 'trend', 'future'])) return 'forecast';
  if (fuzzyMatch(text, ['customer', 'vendor', 'client', 'supplier'])) return 'contacts';
  if (fuzzyMatch(text, ['contact', 'support', 'help', 'bug', 'issue', 'report'])) return 'support';
  return 'unknown';
}

function AiChatBubble({ isBusiness }: { isBusiness: boolean }) {
  const { user, inventory, receivables, payables, expenses, goals } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: `Hello ${user?.name || 'there'}! Ask me about your ${isBusiness ? 'inventory, customers, and receivables' : 'expenses, goals, and savings'}.` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setTimeout(() => {
      const intent = detectIntent(userText);
      let reply = '';
      if (intent === 'greeting') {
        reply = `Hey ${user?.name || 'there'}! ${isBusiness ? 'Your business' : 'Your personal'} workspace is ready. What do you want to check?`;
      } else if (intent === 'thanks') {
        reply = `Anytime, ${user?.name || 'boss'}!`;
      } else if (intent === 'inventory_value') {
        if (!isBusiness) { reply = "Inventory tracking is in the Business workspace."; }
        else {
          const total = inventory.reduce((s, p) => s + p.purchasePrice * p.stock, 0);
          reply = inventory.length === 0 ? "Your inventory is empty." : `Total inventory value: ₹${total.toLocaleString()} across ${inventory.length} items.`;
        }
      } else if (intent === 'low_stock') {
        if (!isBusiness) { reply = "Stock alerts are in the Business workspace."; }
        else {
          const low = inventory.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
          reply = low.length === 0 ? "All items well-stocked!" : `${low.length} item(s) low: ${low.map(p => p.name).join(', ')}.`;
        }
      } else if (intent === 'receivables') {
        if (!isBusiness) { reply = "Receivables are in the Business workspace."; }
        else {
          const total = receivables.reduce((s, r) => s + r.amount, 0);
          reply = total === 0 ? "No outstanding receivables." : `Total receivables: ₹${total.toLocaleString()}.`;
        }
      } else if (intent === 'payables') {
        if (!isBusiness) { reply = "Payables are in the Business workspace."; }
        else {
          const total = payables.reduce((s, p) => s + p.amount, 0);
          reply = total === 0 ? "No pending payables." : `Total payables: ₹${total.toLocaleString()}.`;
        }
      } else if (intent === 'expenses') {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        reply = total === 0 ? "No expenses logged yet." : `Total expenses: ₹${total.toLocaleString()} across ${expenses.length} entries.`;
      } else if (intent === 'balance') {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        reply = `${expenses.length} transaction(s) logged totaling ₹${total.toLocaleString()}.`;
      } else if (intent === 'goals') {
        if (isBusiness) { reply = "Goals are in the Personal workspace."; }
        else {
          reply = goals.length === 0 ? "No goals set yet." : `${goals.length} goal(s): ${goals.map(g => `${g.title} (${Math.round(g.currentAmount/g.targetAmount*100)}%)`).join(', ')}.`;
        }
      } else if (intent === 'saas_audit') {
        if (!isBusiness) { reply = "SaaS audit is a Business workspace feature."; }
        else {
          reply = inventory.length > 0
            ? `${inventory.length} product types in inventory. Use Reports for full analysis.`
            : "No products to audit yet.";
        }
      } else if (intent === 'optimize') {
        const topCat = [...new Set(expenses.map(e => e.category))].slice(0, 3);
        reply = expenses.length === 0
          ? "No expenses to analyze yet. Log some spending first."
          : `Top spending: ${topCat.join(', ')}. Look here for savings.`;
      } else if (intent === 'forecast') {
        reply = isBusiness
          ? "Forecasting is available in Business Reports."
          : "Check Personal Reports for trend analysis.";
      } else if (intent === 'contacts') {
        reply = isBusiness
          ? `You have ${receivables.length} customer record(s) tracked.`
          : "Contacts are managed in the Business workspace.";
      } else if (intent === 'support') {
        reply = "Need help? Visit the Contact page or email support@nexora.ai.";
      } else {
        reply = `Ask about ${isBusiness ? 'inventory, receivables, payables, or savings tips' : 'expenses, goals, balance, or savings tips'}!`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  const accent = isBusiness ? 'bg-primary' : 'bg-primary-emerald';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-black shadow-xl transition-all duration-300 hover:scale-110 ${accent}`}
        >
          <Sparkles size={20} className="animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 z-50 h-80 glass-card border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bot size={14} className={isBusiness ? 'text-primary' : 'text-primary-emerald'} />
              <span className="text-xs font-bold text-white">Nexora AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                  m.sender === 'user'
                    ? `${accent}/20 text-white`
                    : 'bg-white/5 text-gray-300 border border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-3 py-2 text-[11px] glass-input"
            />
            <button
              onClick={handleSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-black ${accent}`}
            >
              <Send size={10} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkspace } = useAppStore();
  const [showMore, setShowMore] = useState(false);
  const isBusiness = activeWorkspace === 'business';

  const primaryLinks = isBusiness ? businessPrimary : personalPrimary;
  const moreLinks = isBusiness ? businessMore : personalMore;
  const activeBgClass = isBusiness ? 'text-primary' : 'text-primary-emerald';

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-panel border-t border-white/10">
        <div className="flex items-start justify-around pt-2 pb-3 px-1">
          {primaryLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                  isActive ? activeBgClass : 'text-gray-400'
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-semibold">{link.name}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-400 rounded-lg"
          >
            <MoreHorizontal size={18} />
            <span className="text-[9px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* More Options Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-45 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-20 left-0 right-0 glass-card border-t border-white/10 rounded-t-2xl mx-2 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-white">More Options</h3>
              <button onClick={() => setShowMore(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => { navigate(link.path); setShowMore(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      isActive
                        ? `${activeBgClass} bg-white/5`
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[9px] font-semibold">{link.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <AiChatBubble isBusiness={isBusiness} />
      </div>
    </>
  );
}
