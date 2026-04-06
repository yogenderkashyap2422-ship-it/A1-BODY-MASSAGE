import { Link, useLocation } from 'react-router-dom';
import { Home, List, ShoppingBag, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: List },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel z-50 pb-safe rounded-t-2xl border-t border-amber-100/50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          // If not logged in, redirect Orders and Profile to login
          const targetPath = (!user && (item.name === 'Orders' || item.name === 'Profile')) ? '/login' : item.path;

          return (
            <Link
              key={item.name}
              to={targetPath}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300",
                isActive ? "text-amber-600 bg-amber-50 shadow-sm" : "text-stone-500 hover:text-amber-600"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive && "fill-amber-100")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
