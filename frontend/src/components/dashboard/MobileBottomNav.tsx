import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import {
  LayoutDashboard,
  Package,
  Users,
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
} from 'lucide-react';
import { useState } from 'react';

const businessPrimary = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Receivables', path: '/receivables', icon: ArrowUpRight },
];

const personalPrimary = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Reports', path: '/personal-reports', icon: BarChart3 },
];

const businessMore = [
  { name: 'Vendors', path: '/vendors', icon: Briefcase },
  { name: 'Payables', path: '/payables', icon: ArrowDownLeft },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

const personalMore = [
  { name: 'Reports', path: '/personal-reports', icon: BarChart3 },
];

function AiChatBubble({ isBusiness }: { isBusiness: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: "Ask Nexora anything about your workspace." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: "AI response coming soon. I'm scanning your records." }]);
    }, 1000);
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
