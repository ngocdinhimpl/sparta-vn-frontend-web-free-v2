import React from 'react';
import { AppTab } from '@/types';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import logo from '@/assets/logo/logo.png';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const AlobridgeBranding: React.FC = () => (
  <div className="flex flex-col items-center gap-1 mt-auto pt-6 border-t border-slate-50 opacity-80 hover:opacity-100 transition-opacity">
    <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] mt-1">Alobridge</span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: AppTab.HOME, icon: Icons.Home, label: t('nav.home') },
    { id: AppTab.TRAINING, icon: Icons.Book, label: t('nav.training') },
    { id: AppTab.HISTORY, icon: Icons.History, label: t('nav.history') },
    { id: AppTab.RANKING, icon: Icons.Trophy, label: t('nav.ranking') },
    { id: AppTab.SETTINGS, icon: Icons.Settings, label: t('nav.settings') },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <img src={logo} alt="Sparta Logo" className="w-10 h-10 object-contain rounded-xl" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sparta</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group ${
              activeTab === item.id 
                ? 'bg-red-50 text-red-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon />
            {item.label}
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </nav>
      <AlobridgeBranding />
    </aside>
  );
};

export default Sidebar;
