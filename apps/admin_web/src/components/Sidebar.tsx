import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Gift,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  Users,
  Compass
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Grievance Central', path: '/complaints', icon: FileText },
    { name: 'SLA Escalations', path: '/escalations', icon: AlertTriangle },
    { name: 'Welfare Schemes', path: '/welfare', icon: Gift },
    { name: 'Ration Transparency', path: '/ration', icon: ShoppingBag },
    { name: 'Audit & Compliance', path: '/audit', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md">
          VG
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-white">Smart Gramin</h1>
          <p className="text-xs text-orange-400 font-medium">District Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3.5 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
