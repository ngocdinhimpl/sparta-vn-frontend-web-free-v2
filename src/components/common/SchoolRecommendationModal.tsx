import React from 'react';
import { trackSchoolLinkClick } from '../../services/analyticsService';
import { RECOMMENDED_SCHOOLS } from '../../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRecommendationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
          おすすめの学校・教材
        </h3>
        
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>発音を基礎からやり直したい、さらに上達したい方へ。以下の学校や教材での学習をおすすめします。</p>
          
          {RECOMMENDED_SCHOOLS.map((school) => (
            <div key={school.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900 mb-1">[学校] {school.name} {school.name.includes('Tieng Viet Oi') || school.name.includes('ZEN') ? '【ベトナム・ハノイ】' : ''}</p>
              <a 
                href={school.url} 
                className="text-blue-500 hover:underline break-all" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => trackSchoolLinkClick(school.url, school.name, school.id)}
              >
                {school.url}
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
