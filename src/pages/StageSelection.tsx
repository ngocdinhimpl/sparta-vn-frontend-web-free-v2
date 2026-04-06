import React from 'react';
import { useTranslation } from '@/i18n';
import { VocabType } from '@/services/storageService';

interface StageCardProps {
  stage: number;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  onSelect: () => void;
  icon: React.ReactNode;
}

const StageCard: React.FC<StageCardProps> = ({ title, description, iconBg, onSelect, icon }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
        {description}
      </p>
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

interface StageSelectionProps {
  vocabType: VocabType;
  onSelect: (stage: number) => void;
  onBack: () => void;
}

const StageSelection: React.FC<StageSelectionProps> = ({ vocabType, onSelect, onBack }) => {
  const { t } = useTranslation();
  const typeText = vocabType === 'word' ? t('training.wordMode') : t('training.phraseMode');
  const typeTextFormatted = typeText.toLowerCase();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-2 px-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-3xl font-extrabold text-slate-900">{t('training.selectStage')}</h2>
      </div>
      <p className="text-slate-500 font-medium px-2 mb-10 pb-4">
        {t('training.selectStageDesc').replace('{mode}', typeTextFormatted)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StageCard 
          stage={1}
          title={t('training.stage1')}
          description={vocabType === 'word' ? t('training.stage1WordDesc') : t('training.stage1PhraseDesc')}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          onSelect={() => onSelect(1)}
          icon={(
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          )}
        />

        <StageCard 
          stage={2}
          title={t('training.stage2')}
          description={vocabType === 'word' ? t('training.stage2WordDesc') : t('training.stage2PhraseDesc')}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          onSelect={() => onSelect(2)}
          icon={(
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          )}
        />
      </div>
    </div>
  );
};

export default StageSelection;
