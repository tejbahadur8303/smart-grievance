import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Gift,
  ShoppingBag,
  LogOut,
  MapPin
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('officer_token');
    localStorage.removeItem('officer_user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Panchayat Desk', path: '/', icon: LayoutDashboard },
    { name: 'Grievance Redressal', path: '/complaints', icon: CheckSquare },
    { name: 'Field Workers', path: '/workers', icon: Users },
    { name: 'Welfare Applications', path: '/welfare', icon: Gift },
    { name: 'Ration Supervision', path: '/ration', icon: ShoppingBag }
  ];

  return (
    <aside className="w-64 bg-emerald-950 text-emerald-100 flex flex-col min-h-screen">
      <div className="p-5 border-b border-emerald-900 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow">
          GP
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white">Gram Panchayat Desk</h1>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center mt-0.5">
            <MapPin className="w-3 h-3 mr-1" />
            <span>Shivpur Panchayat</span>
          </p>
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
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-900/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-900">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3.5 py-2.5 w-full rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
