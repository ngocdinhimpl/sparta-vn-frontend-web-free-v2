import React from 'react';
import { useTranslation } from '@/i18n';
import { VocabType } from '@/services/storageService';

interface ModeCardProps {
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  points: string[];
  onSelect: () => void;
  icon: React.ReactNode;
}

const ModeCard: React.FC<ModeCardProps> = ({ title, description, iconBg, points, onSelect, icon }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-6">
        {description}
      </p>
      <ul className="space-y-3 mb-8 flex-1">
        {points.map((point, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            {point}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect}
        className="w-full py-4 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
      >
        {t('common.start')}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  );
};

const TrainingModes: React.FC<{ onStart: (type: VocabType) => void }> = ({ onStart }) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 px-2">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('training.title')}</h2>
        <p className="text-slate-500 font-medium">{t('training.selectMode')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModeCard 
          title={t('training.wordMode')}
          description={t('training.wordModeDesc')}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          points={[t('training.wordModePoint1'), t('training.wordModePoint2')]}
          onSelect={() => onStart('word')}
          icon={(
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          )}
        />

        <ModeCard 
          title={t('training.phraseMode')}
          description={t('training.phraseModeDesc')}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          points={[t('training.phraseModePoint1'), t('training.phraseModePoint2')]}
          onSelect={() => onStart('phrase')}
          icon={(
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          )}
        />
      </div>
    </div>
  );
};

export default TrainingModes;
