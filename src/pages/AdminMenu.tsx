import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Category, Product } from '../types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { seedData } from '../seed';

export function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newProd, setNewProd] = useState({
    name: '',
    price: 30,
    categoryId: '',
    description: ''
  });

  useEffect(() => {
    const unsubCat = firestoreService.subscribeCategories(setCategories);
    const unsubProd = firestoreService.subscribeProducts(setProducts);
    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName) return;
    await firestoreService.addCategory(newCatName, categories.length + 1);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleAddProduct = async () => {
    if (!newProd.name || !newProd.categoryId) return;
    await firestoreService.addProduct(newProd);
    setNewProd({ name: '', price: 30, categoryId: '', description: '' });
    setIsAddingProduct(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif">菜單管理 Product Catalog</h2>
          <p className="text-tea-text opacity-60">編輯您的好茶品項與分类</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={async () => {
               setIsSeeding(true);
               await seedData();
               setIsSeeding(false);
               alert('初始分類已匯入！請繼續新增產品。');
             }}
             disabled={isSeeding}
             className="bg-white border border-tea-olive/20 text-tea-olive px-4 py-2 rounded-xl text-sm font-medium hover:bg-tea-cream transition-colors flex items-center gap-2 disabled:opacity-50"
           >
             {isSeeding ? '匯入中...' : '匯入預設分類'}
           </button>
           <button 
             onClick={() => setIsAddingCategory(true)}
             className="bg-white border border-tea-olive/20 text-tea-olive px-4 py-2 rounded-xl text-sm font-medium hover:bg-tea-cream transition-colors flex items-center gap-2"
           >
             <Plus size={16} /> 新增分類
           </button>
           <button 
             onClick={() => setIsAddingProduct(true)}
             className="bg-tea-olive text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
           >
             <Plus size={16} /> 新增品項
           </button>
        </div>
      </header>

      {/* Category List */}
      <section className="bg-white rounded-3xl border border-tea-olive/10 shadow-sm overflow-hidden">
        <div className="p-6 bg-tea-cream/30 border-b border-tea-olive/5">
          <h3 className="font-serif text-xl">分類清單</h3>
        </div>
        <div className="divide-y divide-tea-olive/5">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-6 hover:bg-tea-cream/10 transition-colors">
              <div>
                <span className="text-[10px] uppercase font-bold text-tea-olive opacity-40 block mb-1">ORDER #{cat.order}</span>
                <p className="text-lg font-medium">{cat.name}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-tea-text opacity-40 hover:opacity-100 transition-opacity"><Edit2 size={18} /></button>
                <button className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-12 text-center text-tea-text opacity-30 italic">尚未建立任何分類</div>
          )}
        </div>
      </section>

      {/* Product List by Category */}
      {categories.map(cat => (
        <section key={cat.id} className="space-y-4">
          <h3 className="text-xl font-serif text-tea-olive flex items-center gap-3">
             {cat.name}
             <span className="text-xs font-sans opacity-40 font-medium">({products.filter(p => p.categoryId === cat.id).length} 個品項)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.filter(p => p.categoryId === cat.id).map(prod => (
              <div key={prod.id} className="bg-white p-6 rounded-2xl border border-tea-olive/10 shadow-sm flex justify-between items-start group">
                <div>
                  <h4 className="font-medium text-lg">{prod.name}</h4>
                  <p className="text-xs text-tea-text opacity-50 mt-1">{prod.description || '暫無描述'}</p>
                </div>
                <div className="text-right">
                   <p className="font-serif text-lg">NT.{prod.price}</p>
                   <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-tea-cream rounded-lg text-tea-olive hover:bg-tea-olive hover:text-white transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 bg-red-50 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Modals */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingCategory(false)} className="absolute inset-0 bg-tea-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-tea-cream w-full max-w-sm p-8 rounded-3xl relative z-10 shadow-2xl">
              <h3 className="text-2xl font-serif mb-6">新增分類</h3>
              <input 
                autoFocus
                placeholder="分類名稱，如：私房特調" 
                className="w-full bg-white rounded-xl px-4 py-3 mb-6 outline-none border border-tea-olive/10 focus:ring-2 focus:ring-tea-olive transition-all"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setIsAddingCategory(false)} className="flex-1 bg-white py-3 rounded-xl font-medium text-sm border border-tea-olive/10 hover:bg-tea-cream/50 transition-colors">取消</button>
                <button onClick={handleAddCategory} className="flex-1 bg-tea-olive text-white py-3 rounded-xl font-medium text-sm shadow-md">確認儲存</button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingProduct(false)} className="absolute inset-0 bg-tea-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-tea-cream w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl">
              <h3 className="text-2xl font-serif mb-6">新增好茶品項</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1 block">品項名稱</label>
                  <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-tea-olive/10" placeholder="熟成紅茶" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1 block">價格</label>
                  <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: Number(e.target.value)})} className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-tea-olive/10" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1 block">所屬分類</label>
                  <select value={newProd.categoryId} onChange={e => setNewProd({...newProd, categoryId: e.target.value})} className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-tea-olive/10 appearance-none">
                    <option value="">請選擇...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1 block">商品描述</label>
                  <textarea value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-tea-olive/10 h-20 resize-none" placeholder="帶有淡雅花香的溫潤茶感..." />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddingProduct(false)} className="flex-1 bg-white py-3 rounded-xl font-medium text-sm border border-tea-olive/10">取消</button>
                <button onClick={handleAddProduct} className="flex-1 bg-tea-olive text-white py-3 rounded-xl font-medium text-sm shadow-md">確認儲存</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
