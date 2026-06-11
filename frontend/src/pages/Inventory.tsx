import React, { useState, useEffect } from 'react';
import { useAppStore, Product } from '../store/appStore';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Search,
  CheckCircle,
  FileDown,
  FileUp,
  X,
  Camera
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Inventory() {
  const { inventory, addProduct, editProduct, deleteProduct } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);
  const [purchasePrice, setPurchasePrice] = useState<number>(10000);
  const [sellingPrice, setSellingPrice] = useState<number>(15000);

  // Selected product forecast state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(inventory[1]);
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedProduct) {
      mockApi.getInventoryForecast(selectedProduct.id).then(setForecastData);
    } else {
      setForecastData([]);
    }
  }, [selectedProduct]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name,
      sku,
      category,
      stock,
      minStock,
      purchasePrice,
      sellingPrice
    });
    // Reset Form
    setName('');
    setSku('');
    setStock(10);
    setMinStock(5);
    setShowAddModal(false);
  };

  const filtered = inventory.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stock health percentage: (In Stock products / Total products) * 100
  const totalItems = inventory.length;
  const inStockItems = inventory.filter(p => p.status === 'In Stock').length;
  const healthPercent = Math.round((inStockItems / totalItems) * 100);



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-display">Warehouse Inventory</h2>
          <p className="text-xs text-gray-400 mt-1">Audit active SKU configurations, low-stock alarms, and supply ARIMA forecasts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Products exported to CSV.')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold hover:bg-white/10 transition-all"
          >
            <FileDown size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus size={14} />
            <span>Add Product SKU</span>
          </button>
        </div>
      </div>

      {/* Analytics: Health Gauge & ARIMA Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stock Health circular progress widget */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-6">Overall Stock Health</span>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 shadow-[0_0_20px_rgba(0,212,255,0.05)]"></div>
            
            {/* SVG circle health bar */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(0, 212, 255, 0.1)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="#00D4FF"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * healthPercent) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white font-display">{healthPercent}%</span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Optimized</span>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-400 mt-6 leading-relaxed max-w-[200px]">
            {inStockItems} of {totalItems} catalog entries are currently stable. {totalItems - inStockItems} items require immediate supply purchase.
          </p>
        </div>

        {/* ARIMA Forecast Graph panel */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white">90-Day ARIMA Inventory Forecast</h3>
              <p className="text-[10px] text-gray-500">Regression forecast modeling for: <span className="text-cyan-400 font-bold">{selectedProduct?.name || 'MacBook Pro'}</span></p>
            </div>
            <select 
              value={selectedProduct?.id}
              onChange={(e) => setSelectedProduct(inventory.find(p => p.id === e.target.value) || null)}
              className="bg-background border border-white/10 text-white text-[10px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {inventory.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(8, 11, 20, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="projectedStock" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Search and Listing Grid */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search product SKU, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs glass-input"
            />
          </div>
          <span className="text-[10px] text-gray-500 font-bold">{filtered.length} Items Indexed</span>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 font-bold uppercase tracking-wider bg-white/[0.01]">
                <th className="p-4">Product Info</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Levels</th>
                <th className="p-4">Unit Pricing</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filtered.map((product) => {
                const isLow = product.status === 'Low Stock';
                const isOut = product.status === 'Out of Stock';
                
                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                      isLow ? 'bg-amber-500/[0.02]' : isOut ? 'bg-red-500/[0.02]' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded bg-white/5 border border-white/5 flex items-center justify-center text-gray-400`}>
                          <Package size={16} />
                        </div>
                        <span className="font-semibold text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{product.sku}</td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4 font-bold">{product.stock} units <span className="text-[10px] text-gray-500 font-normal">(Min: {product.minStock})</span></td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span>Sell: ₹{product.sellingPrice.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500">Buy: ₹{product.purchasePrice.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        isOut 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                          : isLow 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => editProduct(product.id, { stock: product.stock + 5 })}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-cyan-400 flex items-center justify-center border border-white/5"
                          title="Restock 5 units"
                        >
                          <Plus size={12} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center border border-white/5"
                          title="Delete SKU"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-black text-white font-display mb-4">Add Product SKU</h3>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. iPad Pro M4"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">SKU Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. TAB-IPA-09"
                    className="flex-1 px-3 py-2 text-xs glass-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                    title="Scan barcode"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Current Stock</label>
                  <input 
                    type="number" 
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Min Threshold</label>
                  <input 
                    type="number" 
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Purchase Price (Buy)</label>
                  <input 
                    type="number" 
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Selling Price (Sell)</label>
                  <input 
                    type="number" 
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs glass-input"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-black font-bold text-xs hover:bg-cyan-400 transition-all uppercase mt-6"
              >
                Insert SKU Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={(code) => setSku(code)}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
