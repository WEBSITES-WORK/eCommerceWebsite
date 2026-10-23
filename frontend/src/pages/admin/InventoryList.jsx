import React, { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, Check, Save, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const InventoryList = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockChanges, setStockChanges] = useState({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?all=true&limit=100&keyword=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const handleStockInputChange = (productId, field, value) => {
    setStockChanges((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSaveStock = async (product) => {
    const changes = stockChanges[product._id];
    if (!changes) return;

    try {
      const payload = {
        stock: changes.stock !== undefined ? Number(changes.stock) : product.stock,
        lowStockThreshold:
          changes.lowStockThreshold !== undefined
            ? Number(changes.lowStockThreshold)
            : product.lowStockThreshold,
      };

      const res = await api.patch(`/products/${product._id}/inventory`, payload);
      if (res.success) {
        showToast(`Stock updated for ${product.title}`, 'success');
        // Clear local modification
        setStockChanges((prev) => {
          const cp = { ...prev };
          delete cp[product._id];
          return cp;
        });
        fetchInventory();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Inventory Control</h1>
          <p className="text-xs text-[#707887]">Live warehouse stocks, threshold alert configurations, and replenishment</p>
        </div>

        {lowStockCount > 0 && (
          <div className="px-4 py-2 bg-amber-950/40 border border-amber-900/60 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{lowStockCount} items at or below low stock threshold!</span>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#707887]" />
        <input
          type="text"
          placeholder="Filter by product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-[#F5F7FA] placeholder-[#707887]"
        />
      </div>

      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318]/90 text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4">Inventory Health</th>
                <th className="py-3 px-4 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#707887]">Loading stock records...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#707887]">No products found.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const currentChanges = stockChanges[p._id] || {};
                  const currentStockVal =
                    currentChanges.stock !== undefined ? currentChanges.stock : p.stock;
                  const currentThresholdVal =
                    currentChanges.lowStockThreshold !== undefined
                      ? currentChanges.lowStockThreshold
                      : p.lowStockThreshold;

                  const isLow = Number(currentStockVal) <= Number(currentThresholdVal);
                  const isModified = !!stockChanges[p._id];

                  return (
                    <tr key={p._id} className="hover:bg-[#1B2029]/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-xl border border-[#252B35] flex-shrink-0 bg-[#101318]"
                          />
                          <p className="font-bold text-[#F5F7FA] max-w-[200px] truncate">{p.title}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#707887]">{p.sku}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={currentStockVal}
                          onChange={(e) => handleStockInputChange(p._id, 'stock', e.target.value)}
                          className="w-20 px-2.5 py-1.5 bg-[#101318] border border-[#252B35] rounded-xl text-xs font-bold outline-none text-[#F5F7FA] focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={currentThresholdVal}
                          onChange={(e) =>
                            handleStockInputChange(p._id, 'lowStockThreshold', e.target.value)
                          }
                          className="w-16 px-2.5 py-1.5 bg-[#101318] border border-[#252B35] rounded-xl text-xs font-bold outline-none text-[#F5F7FA] focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        {p.stock === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">
                            Depleted
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={!isModified}
                          onClick={() => handleSaveStock(p)}
                          className={`p-2 rounded-xl transition ${
                            isModified
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                              : 'text-[#707887] opacity-30 cursor-not-allowed'
                          }`}
                          title="Save stock update"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
