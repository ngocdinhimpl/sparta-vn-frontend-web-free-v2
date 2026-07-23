import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { VocabType, storageService } from '@/services/storageService';
import { VOCAB_DATA } from '@/constants';

interface StageNodeProps {
  stage: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  isComingSoon?: boolean;
  onSelect?: () => void;
  isLast?: boolean;
  averageScore?: number;
}

const StageNode: React.FC<StageNodeProps> = ({ stage, title, description, isUnlocked, isComingSoon, onSelect, isLast, averageScore }) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Connecting Line to next node */}
      {!isLast && (
        <div className={`absolute top-12 bottom-0 w-2 h-full -mb-12 ${isUnlocked ? 'bg-red-200' : 'bg-slate-100'} z-0`}></div>
      )}

      {/* Node Content */}
      <div 
        onClick={isUnlocked && !isComingSoon ? onSelect : undefined}
        className={`relative z-10 w-full max-w-sm mx-auto rounded-3xl p-6 border-4 flex flex-col items-center text-center transition-all ${
          isComingSoon 
            ? 'bg-slate-50 border-slate-200 opacity-80' 
            : isUnlocked 
              ? 'bg-white border-red-500 shadow-xl cursor-pointer hover:scale-105' 
              : 'bg-slate-100 border-slate-300 opacity-60'
        }`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 ${
          isComingSoon 
            ? 'bg-slate-200 border-slate-300 text-slate-400' 
            : isUnlocked 
              ? 'bg-red-500 border-red-100 text-white shadow-lg' 
              : 'bg-slate-300 border-slate-200 text-slate-500'
        }`}>
          {isComingSoon ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ) : isUnlocked ? (
            <span className="text-2xl font-black">{stage}</span>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          )}
        </div>
        
        <h3 className={`text-2xl font-black mb-2 ${isUnlocked && !isComingSoon ? 'text-slate-800' : 'text-slate-500'}`}>
          {title}
        </h3>
        <p className={`font-medium leading-relaxed ${isUnlocked && !isComingSoon ? 'text-slate-600' : 'text-slate-400'}`}>
          {description}
        </p>
        
        {isUnlocked && !isComingSoon && averageScore !== undefined && (
          <div className="mt-2 flex flex-col items-center">
            <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {t('training.avg_score_label')}: <span className={averageScore >= 60 ? 'text-emerald-500' : 'text-amber-500'}>{averageScore}</span>
            </div>
          </div>
        )}
        
        {isUnlocked && !isComingSoon && (
          <button className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-red-200 transition-colors">
            {t('common.start')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        )}
      </div>
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
  
  const [unlockedStage, setUnlockedStage] = useState<number>(1);
  const [stageAverages, setStageAverages] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const stage = await storageService.getUnlockedStage();
      setUnlockedStage(stage);
      
      // Calculate averages for each stage
      const allResults = await storageService.getAllPronunciationResults();
      const averages: Record<number, number> = {};
      
      for (let s = 1; s <= 4; s++) {
        const stageItems = VOCAB_DATA.filter(v => v.type === vocabType && v.stage === s);
        if (stageItems.length > 0) {
          let totalScore = 0;
          let completedCount = 0;
          
          for (const item of stageItems) {
            const res = allResults.find(r => r.vocab_id === item.id);
            if (res) {
              completedCount++;
              totalScore += res.averageOverallScore || 0;
            }
          }
          
          // Calculate average against total items in stage, or just completed items?
          // "tổng điểm chia cho số lượng bài trong stage"
          averages[s] = Math.round(totalScore / stageItems.length) || 0;
        }
      }
      setStageAverages(averages);
      setLoading(false);
    };
    
    loadData();
  }, [vocabType]);

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin"></div></div>;
  }

  const stages = [
    {
      stage: 1,
      title: t('training.stage1'),
      description: vocabType === 'word' ? t('training.stage1WordDesc') : t('training.stage1PhraseDesc')
    },
    {
      stage: 2,
      title: t('training.stage2'),
      description: vocabType === 'word' ? t('training.stage2WordDesc') : t('training.stage2PhraseDesc')
    },
    {
      stage: 3,
      title: t('training.stage3'),
      description: vocabType === 'word' ? t('training.stage3WordDesc') : t('training.stage3PhraseDesc')
    },
    {
      stage: 4,
      title: t('training.stage4'),
      description: vocabType === 'word' ? t('training.stage4WordDesc') : t('training.stage4PhraseDesc')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-4 mb-2 px-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-3xl font-extrabold text-slate-900">{t('training.selectStage')}</h2>
      </div>
      <div className="flex flex-col px-2 mb-10 pb-4 text-center md:text-left">
        <p className="text-slate-500 font-medium">
          {t('training.selectStageDesc').replace('{mode}', typeTextFormatted)}
        </p>
        <p className="text-rose-500 text-sm font-bold mt-2">
          {t('training.unlock_warning')}
        </p>
      </div>

      {/* Roadmap Container */}
      <div className="flex flex-col items-center gap-12 py-8 relative w-full">
        {stages.map((s, index) => (
          <StageNode
            key={s.stage}
            stage={s.stage}
            title={s.title}
            description={s.description || ''}
            isUnlocked={s.stage <= unlockedStage}
            averageScore={stageAverages[s.stage]}
            onSelect={() => onSelect(s.stage)}
          />
        ))}

        {/* Coming Soon Node */}
        <StageNode
          stage={5}
          title={t('training.stage5')}
          description={t('training.stage5Desc')}
          isUnlocked={false}
          isComingSoon={true}
          isLast={true}
        />
      </div>
    </div>
  );
};

export default StageSelection;
