import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    return firestoreService.subscribeOrders(setOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'preparing': return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}><Clock size={16} /></motion.div>;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif">訂單管理 Dashboard</h2>
          <p className="text-tea-text opacity-60">隨時掌控每份好茶的製作進度</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-tea-olive/10 shadow-sm text-center min-w-[120px]">
             <p className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1">製作中</p>
             <p className="text-2xl font-serif">{activeOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-tea-olive/10 shadow-sm text-center min-w-[120px]">
             <p className="text-[10px] uppercase font-bold text-tea-olive opacity-50 mb-1">今日已完成</p>
             <p className="text-2xl font-serif">{pastOrders.filter(o => o.status === 'completed').length}</p>
          </div>
        </div>
      </header>

      {/* Active Orders Section */}
      <section>
        <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-tea-olive animate-pulse" />
          傳送門：當前訂單
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {activeOrders.map(order => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-tea-olive/10 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-tea-olive/5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-serif text-lg">#{order.id.slice(-4).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status === 'pending' ? '等候中' : '製作中'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-50 mb-1">
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'HH:mm:ss') : 'Just now'}
                    </p>
                    <p className="font-serif text-xl text-tea-olive">NT.{order.total}</p>
                  </div>
                </div>

                <div className="p-6 space-y-3 bg-tea-cream/30">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-tea-olive/5">
                      <div>
                        <p className="font-medium">{item.name} <span className="text-xs opacity-50">x{item.quantity}</span></p>
                        <p className="text-[10px] uppercase font-bold text-tea-olive/60">{item.sugar} / {item.ice}</p>
                      </div>
                      <p className="text-sm font-serif">NT.{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-tea-cream/50 flex gap-2">
                  {order.status === 'pending' ? (
                    <button 
                      onClick={() => firestoreService.updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-tea-olive text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      開始製作
                    </button>
                  ) : (
                    <button 
                      onClick={() => firestoreService.updateOrderStatus(order.id, 'completed')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      完成取餐
                    </button>
                  )}
                  <button 
                    onClick={() => firestoreService.updateOrderStatus(order.id, 'cancelled')}
                    className="bg-white text-red-500 border border-red-100 p-3 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeOrders.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-tea-olive/20 text-tea-text opacity-40">
              目前沒有待處理訂單
            </div>
          )}
        </div>
      </section>

      {/* History Section */}
      <section>
        <h3 className="text-xl font-medium mb-6 opacity-60">歷史紀錄</h3>
        <div className="bg-white rounded-3xl border border-tea-olive/10 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-tea-cream/50 border-b border-tea-olive/5 text-[10px] uppercase tracking-widest font-bold text-tea-olive">
              <tr>
                <th className="px-6 py-4">時間</th>
                <th className="px-6 py-4">訂單編號</th>
                <th className="px-6 py-4">顧客</th>
                <th className="px-6 py-4">品項</th>
                <th className="px-6 py-4">總金額</th>
                <th className="px-6 py-4">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tea-olive/5">
              {pastOrders.map(order => (
                <tr key={order.id} className="text-sm hover:bg-tea-cream/20 transition-colors">
                  <td className="px-6 py-4 opacity-60">
                    {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MM/dd HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 font-serif">#{order.id.slice(-4).toUpperCase()}</td>
                  <td className="px-6 py-4 font-medium">{order.customerName}</td>
                  <td className="px-6 py-4 text-xs">
                    {order.items.map(i => `${i.name}x${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-serif">NT.{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status === 'completed' ? '已完成' : '已取消'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pastOrders.length === 0 && (
            <div className="py-12 text-center text-tea-text opacity-30 italic">
              尚未有歷史紀錄
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
