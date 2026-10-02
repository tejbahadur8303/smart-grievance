import React from 'react';
import { Bell, ShieldAlert, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const userStr = localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Administrator' };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Healthy</span>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-sm shadow">
            {user.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">{user.name}</p>
            <p className="text-[11px] text-slate-400 capitalize">District Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};
