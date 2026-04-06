import React, { useEffect, useState } from 'react';
import { VOCAB_DATA } from '@/constants';
import { useTranslation } from '@/i18n';
import { storageService, VocabItem, VocabType } from '@/services/storageService';
import VocabularyListSkeleton from '@/components/skeletons/VocabularyListSkeleton';

interface VocabularyListProps {
  vocabType: VocabType;
  stage?: number;
  onBack: () => void;
  onSelectItem: (item: VocabItem) => void;
  onItemsLoaded?: (items: VocabItem[]) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({ vocabType, stage, onBack, onSelectItem, onItemsLoaded }) => {
  const { t } = useTranslation();
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVocabulary = async () => {
      let storedVocab = await storageService.getVocabulary();
      
      // Initialize with default data if not exists
      if (!storedVocab) {
        await storageService.setVocabulary(VOCAB_DATA as VocabItem[]);
        storedVocab = VOCAB_DATA as VocabItem[];
      }
      
      // Filter by type and stage check
      const filtered = storedVocab.filter(item => {
        if (item.type !== vocabType) return false;
        if (stage && item.stage !== stage) return false;
        return true;
      });
      setVocabulary(filtered);
      
      // Notify parent about loaded items
      if (onItemsLoaded) {
        onItemsLoaded(filtered);
      }
      
      // Check completion status for each item
      const completedSet = new Set<string>();
      for (const item of filtered) {
        const isCompleted = await storageService.isVocabCompleted(item.id);
        if (isCompleted) {
          completedSet.add(item.id);
        }
      }
      setCompletedIds(completedSet);
      
      setLoading(false);
    };

    loadVocabulary();
  }, [vocabType, stage]);

  if (loading) {
    return <VocabularyListSkeleton />;
  }
  
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md py-4 z-10 px-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{t('training.vocabularyList')}</h2>
      </div>

      {/* List Container */}
      <div className="space-y-4 px-2">
        {vocabulary.map((item) => {
          const isCompleted = completedIds.has(item.id);
          
          return (
          <div 
            key={item.id}
            className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:border-red-200 transition-all group cursor-pointer"
            onClick={() => onSelectItem(item)}
          >
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">{item.vi}</h3>
              <p className="text-sm font-medium text-slate-400">{item.jp}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isCompleted && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <svg className="text-red-500 group-hover:text-white transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default VocabularyList;
