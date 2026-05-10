import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Category, Product, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection state for modal
  const [sugar, setSugar] = useState('正常');
  const [ice, setIce] = useState('正常');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const unsubCat = firestoreService.subscribeCategories(setCategories);
    const unsubProd = firestoreService.subscribeProducts(setProducts);
    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-tea-text opacity-50 space-y-4">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-8 h-8 border-2 border-tea-olive border-t-transparent rounded-full shadow-lg"
        />
        <p className="font-serif text-xl italic">茶藝醞釀中...</p>
      </div>
    );
  }

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const newItem: OrderItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      sugar,
      ice,
      quantity
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setSugar('正常');
    setIce('正常');
    setQuantity(1);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await firestoreService.createOrder({
        customerName: customerName || '匿名顧客',
        items: cart,
        total
      });
      
      // Success flow
      setCart([]);
      setCustomerName('');
      setIsCartOpen(false);
      alert('🌟 訂單成功！請至櫃檯領取您的美味茶飲。');
    } catch (e) {
      console.error("Order error:", e);
      alert('下單失敗，請檢查網路連線後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pb-24">
      {/* Categories Hero */}
      <section className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-serif mb-4">純粹好茶，靜謐時光</h2>
        <div className="h-0.5 w-24 bg-tea-olive mx-auto mb-8"></div>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button 
              key={cat.id}
              className="px-6 py-2 rounded-full border border-tea-olive text-tea-olive hover:bg-tea-olive hover:text-white transition-colors text-sm font-medium"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <React.Fragment key={cat.id}>
            <div className="col-span-full mt-8">
              <h3 className="text-2xl font-serif border-b border-tea-olive/10 pb-2">{cat.name}</h3>
            </div>
            {products.filter(p => p.categoryId === cat.id).map(product => (
              <motion.div 
                key={product.id}
                layoutId={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white p-6 rounded-2xl border border-tea-olive/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <h4 className="text-lg font-medium group-hover:text-tea-olive transition-colors">{product.name}</h4>
                  <p className="text-sm text-tea-text opacity-60 mt-1 lines-clamp-2">{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl">NT.{product.price}</p>
                  <div className="mt-2 w-8 h-8 rounded-full bg-tea-cream flex items-center justify-center group-hover:bg-tea-olive group-hover:text-white transition-colors">
                    <Plus size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Floating Cart Trigger */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 bg-tea-olive text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-40 group"
          >
            <ShoppingBag size={20} />
            <span className="font-medium">購物車 ({cart.length})</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-serif">NT.{total}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-tea-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-tea-cream w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-serif mb-2">{selectedProduct.name}</h3>
                    <p className="text-tea-text opacity-70 italic">NT.{selectedProduct.price}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-tea-olive/10 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Sugar */}
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-tea-olive mb-3 block">甜度選擇</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['正常', '少糖', '半糖', '微糖', '無糖'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSugar(opt)}
                          className={cn(
                            "py-2 text-sm rounded-xl border transition-all",
                            sugar === opt ? "bg-tea-olive text-white border-tea-olive" : "bg-white border-tea-olive/10 text-tea-text hover:border-tea-olive/50"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ice */}
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-tea-olive mb-3 block">冰量選擇</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['正常', '少冰', '微冰', '去冰', '熱飲'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setIce(opt)}
                          className={cn(
                            "py-2 text-sm rounded-xl border transition-all",
                            ice === opt ? "bg-tea-olive text-white border-tea-olive" : "bg-white border-tea-olive/10 text-tea-text hover:border-tea-olive/50"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between pt-4 border-t border-tea-olive/10">
                    <div className="flex items-center gap-4 bg-white rounded-2xl p-2 border border-tea-olive/10">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-tea-cream rounded-xl transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-serif text-lg">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-tea-cream rounded-xl transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={addToCart}
                      className="bg-tea-olive text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      加入購物車 (NT.{selectedProduct.price * quantity})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-tea-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-tea-cream shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-tea-olive/10 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-tea-olive" />
                  <h3 className="text-2xl font-serif">您的點單</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-tea-cream rounded-full">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-tea-text opacity-40 italic">
                    <ShoppingBag size={48} className="mb-4" />
                    <p>購物車是空的</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl border border-tea-olive/5 shadow-sm flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-tea-olive/60 bg-tea-cream px-1.5 py-0.5 rounded">{item.sugar}</span>
                          <span className="text-[10px] uppercase font-bold text-tea-olive/60 bg-tea-cream px-1.5 py-0.5 rounded">{item.ice}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif">NT.{item.price * item.quantity}</p>
                        <p className="text-xs opacity-60">x{item.quantity}</p>
                        <button 
                          onClick={() => removeFromCart(index)}
                          className="mt-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-white border-t border-tea-olive/10 space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-tea-olive mb-2 block">顧客姓名</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="例如：王小明"
                    className="w-full bg-tea-cream border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-tea-olive transition-all outline-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tea-text opacity-60">總計金額</span>
                  <span className="text-3xl font-serif text-tea-olive">NT.{total}</span>
                </div>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full bg-tea-olive text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isSubmitting && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />}
                  {isSubmitting ? '處理中...' : '確認下單'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
