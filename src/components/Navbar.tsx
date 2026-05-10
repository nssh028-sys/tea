import { Link, useLocation } from 'react-router-dom';
import { Coffee, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import { motion } from 'motion/react';

export function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-tea-olive/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-tea-olive flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <Coffee size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">TeaOrder</h1>
            <p className="text-[10px] uppercase tracking-widest text-tea-olive opacity-70">Authentic Tea Experience</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-tea-olive ${!isAdmin ? 'text-tea-olive' : 'text-tea-text'}`}
          >
            <UtensilsCrossed size={18} />
            <span className="hidden sm:inline">立即點餐</span>
          </Link>
          <Link 
            to="/admin" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-tea-olive ${isAdmin ? 'text-tea-olive' : 'text-tea-text'}`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">後台管理</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
