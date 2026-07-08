import React from 'react';
import { AppTab } from '@/types';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import logo from '@/assets/logo/logo.png';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}


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

      {/* Beta Feedback Button */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => onTabChange(AppTab.FEEDBACK)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm border-2 ${
            activeTab === AppTab.FEEDBACK
              ? 'bg-yellow-100 text-yellow-800 border-yellow-400 shadow-yellow-200'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
          }`}
        >
          <Icons.Message />
          <span>{t('nav.feedback')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
