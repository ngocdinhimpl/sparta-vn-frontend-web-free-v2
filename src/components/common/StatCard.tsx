import React from 'react';
import { Stat } from '@/types';

const StatCard: React.FC<Stat> = ({ label, value, unit, icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
      <div className={`text-4xl font-extrabold flex items-baseline gap-1 ${colorClass}`}>
        {icon && <span className="text-2xl mr-1">{icon}</span>}
        {value}
        {unit && <span className="text-lg font-bold opacity-70">{unit}</span>}
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
};

export default StatCard;
