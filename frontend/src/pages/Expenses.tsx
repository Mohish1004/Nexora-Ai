import React, { useState } from 'react';
import { useAppStore, Expense } from '../store/appStore';
import { 
  Plus, 
  Search, 
  FileText, 
  Grid, 
  List, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Upload, 
  DollarSign, 
  PieChart as PieIcon, 
  Layers,
  FileCheck
} from 'lucide-react';
import { mockApi, OCRResult } from '../services/mockApi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Expenses() {
  const { expenses, addExpense } = useAppStore();
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  
  // OCR states
  const [dragActive, setDragActive] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'categorizing' | 'analyzing' | 'done'>('idle');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addExpense({ amount, category, date, notes });
    setAmount(0);
    setNotes('');
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    // Run Simulated AI OCR Steps
    setScanState('scanning');
    
    setTimeout(() => {
      setScanState('categorizing');
      
      setTimeout(() => {
        setScanState('analyzing');
        
        setTimeout(async () => {
          const result = await mockApi.scanReceipt(file);
          setOcrResult(result);
          setScanState('done');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const acceptOcrResult = () => {
    if (!ocrResult) return;
    addExpense({
      amount: ocrResult.amount,
      category: ocrResult.category,
      date: ocrResult.date,
      notes: `Extracted: ${ocrResult.vendor} (${ocrResult.detectedItems.join(', ')})`
    });
    setOcrResult(null);
    setScanState('idle');
  };

  const filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(search.toLowerCase()) || 
    e.notes.toLowerCase().includes(search.toLowerCase())
  );

  // Heatmap generation: 30 days of random expenditure intensity (similar to GitHub commits)
  const heatmapSquares = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    // Calculate simulated spending for that day
    const match = expenses.find(e => parseInt(e.date.split('-')[2]) === day);
    const amount = match ? match.amount : Math.random() > 0.5 ? Math.floor(Math.random() * 2000) : 0;
    
    let color = 'bg-white/5'; // zero
    if (amount > 0 && amount <= 1000) color = 'bg-emerald-500/20'; // low
    else if (amount > 1000 && amount <= 3000) color = 'bg-emerald-500/40'; // medium
    else if (amount > 3000) color = 'bg-emerald-500/70 shadow-[0_0_8px_rgba(0,230,118,0.3)]'; // high
    
    return { day, color, amount };
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white font-display">Personal Expense Desk</h2>
        <p className="text-xs text-gray-400 mt-1">Audit personal receipts, log transactions, and evaluate categorized outflows.</p>
      </div>

      {/* Row 1: OCR Scanner & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OCR Scanner */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-400" />
              <span>Smart Receipt OCR Scanner</span>
            </h3>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">AI Powered</span>
          </div>

          {scanState === 'idle' && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all ${
                dragActive ? 'border-primary-emerald bg-primary-emerald/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Upload size={32} className="text-gray-500 mb-4" />
              <p className="text-xs text-white font-medium">Drag screenshot, drop PDF statement or browse files</p>
              <span className="text-[10px] text-gray-500 mt-1">Files processed locally via Nexora OCR</span>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              <label 
                htmlFor="file-upload"
                className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 cursor-pointer uppercase transition-all"
              >
                Browse File
              </label>
            </div>
          )}

          {scanState !== 'idle' && scanState !== 'done' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {scanState === 'scanning' && 'Scanning Receipt Layout...'}
                  {scanState === 'categorizing' && 'Categorizing Transaction Line...'}
                  {scanState === 'analyzing' && 'Analyzing Tax & Amounts...'}
                </span>
                <span className="text-[10px] text-gray-500">Wait a few seconds</span>
              </div>
            </div>
          )}

          {scanState === 'done' && ocrResult && (
            <div className="flex-1 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-4 animate-float-fast">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white">{ocrResult.vendor}</span>
                <span className="text-xs font-black text-emerald-400 font-display">₹{ocrResult.amount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
                <div>Category: <span className="text-white font-bold">{ocrResult.category}</span></div>
                <div>Date: <span className="text-white font-bold">{ocrResult.date}</span></div>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Extracted Items:</span>
                <p className="text-[10px] text-gray-300 italic">{ocrResult.detectedItems.join(', ')}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setScanState('idle')}
                  className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] border border-white/10"
                >
                  Discard
                </button>
                <button 
                  onClick={acceptOcrResult}
                  className="flex-1 py-2 rounded bg-primary-emerald text-black font-bold text-[10px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-1"
                >
                  <FileCheck size={12} />
                  <span>Insert to Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Expense Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="border-b border-white/5 pb-3 mb-4">
            <h3 className="font-bold text-sm text-white">Manual Outflow Entry</h3>
          </div>
          
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Outflow Amount</label>
                <input 
                  type="number"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  placeholder="₹ Amount"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input bg-background focus:outline-none focus:border-emerald-500"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Travel">Travel & Commute</option>
                  <option value="Shopping">Shopping & Tech</option>
                  <option value="Bills">Broadband & Bills</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Transaction Date</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-input"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Add Notes / Details</label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dinner with squad..."
                className="w-full px-3 py-2 text-xs glass-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary-emerald text-black font-bold text-xs hover:bg-emerald-400 transition-all uppercase tracking-wider"
            >
              Insert Outflow
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: Heatmap & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-1 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-white">Daily Outflow Heatmap</h3>
            <p className="text-[9px] text-gray-500 mt-1">Calendar distribution showing spending frequency.</p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 my-auto">
            {heatmapSquares.map((item) => (
              <div 
                key={item.day}
                className={`aspect-square w-full rounded ${item.color} flex items-center justify-center text-[8px] font-mono font-bold text-white/50 cursor-pointer hover:scale-110 transition-transform`}
                title={`Day ${item.day}: ₹${item.amount.toLocaleString()}`}
              >
                {item.day}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-white/5 pt-4 mt-4 uppercase font-bold tracking-wider">
            <span>Less outflow</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded bg-white/5"></span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20"></span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40"></span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/70"></span>
            </div>
            <span>More outflow</span>
          </div>
        </div>

        {/* Ledger list */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h3 className="font-bold text-sm text-white">Outflow Ledger</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-emerald/10 text-primary-emerald' : 'text-gray-500'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-primary-emerald/10 text-primary-emerald' : 'text-gray-500'}`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>

          {/* List display */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-bold uppercase tracking-wider pb-2">
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 pr-4 font-semibold text-white">{item.notes}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-300 border border-white/5">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono">{item.date}</td>
                      <td className="py-3 text-right font-black text-white">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Grid display */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-mono">{item.date}</span>
                    <span className="text-xs font-black text-white">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{item.notes}</h4>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-bold text-gray-400 border border-white/5 inline-block">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
