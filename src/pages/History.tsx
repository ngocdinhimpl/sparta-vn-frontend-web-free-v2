import React, { useState, useEffect } from 'react';
import { Icons, HISTORY_DATA } from '@/constants';
import { useTranslation } from '@/i18n';
import { storageService } from '@/services/storageService';
import HistorySkeleton from '@/components/skeletons/HistorySkeleton';

interface HistoryItemData {
  vocab_id: string;
  vocabText: string;
  type: 'word' | 'phrase';
  accuracy: number;
  overall: number;
  averageOverallScore: number;
  fluency: number;
  completeness: number;
  updatedAt: string;
}

interface HistoryProps {
  onStartTraining: () => void;
}

const History: React.FC<HistoryProps> = ({ onStartTraining }) => {
  const { t } = useTranslation();
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageStats, setAverageStats] = useState({
    overall: 0,
    accuracy: 0,
    fluency: 0,
    completeness: 0,
  });

  useEffect(() => {
    const loadHistory = async () => {
      // Get all pronunciation results from IndexedDB
      const vocabulary = await storageService.getVocabulary();
      if (!vocabulary) {
        setLoading(false);
        return;
      }

      const items: HistoryItemData[] = [];
      const allResults = await storageService.getAllPronunciationResults();
      
      // Create a map for quick lookup
      const resultMap = new Map(allResults.map(r => [r.vocab_id, r]));
      
      for (const vocab of vocabulary) {
        const result = resultMap.get(vocab.id);
        if (result) {
          items.push({
            vocab_id: vocab.id,
            vocabText: vocab.vi,
            type: vocab.type,
            accuracy: result.response?.score?.accuracy || 0,
            overall: result.response?.score?.overall || 0,
            averageOverallScore: result.averageOverallScore || result.response?.score?.overall || 0,
            fluency: result.response?.score?.fluency || 0,
            completeness: result.response?.score?.completeness || 0,
            updatedAt: result.updated_at,
          });
        }
      }

      // Sort by updatedAt desc (newest first)
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      // Calculate averages
      if (items.length > 0) {
        const totalOverall = items.reduce((sum, item) => sum + item.overall, 0);
        const totalAccuracy = items.reduce((sum, item) => sum + item.accuracy, 0);
        const totalFluency = items.reduce((sum, item) => sum + item.fluency, 0);
        const totalCompleteness = items.reduce((sum, item) => sum + item.completeness, 0);
        
        setAverageStats({
          overall: Math.round(totalOverall / items.length),
          accuracy: Math.round(items.reduce((sum, item) => sum + item.averageOverallScore, 0) / items.length),
          fluency: Math.round(totalFluency / items.length),
          completeness: Math.round(totalCompleteness / items.length),
        });
      }
      
      setHistoryItems(items);
      setLoading(false);
    };

    loadHistory();
  }, []);

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      {/* Summary Card - Updated with Red theme */}
      <div className="bg-red-500 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-red-100 mb-12 min-h-[320px] flex flex-col justify-center">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-red-50 text-xs font-black uppercase tracking-[0.2em] opacity-90 mb-2">{t('history.overall_score')}</p>
              <h2 className="text-7xl font-black tracking-tighter">{averageStats.overall}</h2>
            </div>
            <div className="w-16 h-16 bg-white/25 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shadow-lg border border-white/20">
              <Icons.Trophy />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/15 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">{t('history.average_score')}</p>
              <p className="text-2xl font-black">{averageStats.accuracy}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">Fluency</p>
              <p className="text-2xl font-black">{averageStats.fluency}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">Complete</p>
              <p className="text-2xl font-black">{averageStats.completeness}</p>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-red-400/40 rounded-full blur-[80px]"></div>
        <div className="absolute left-1/4 -top-10 w-40 h-40 bg-white/15 rounded-full blur-[60px]"></div>
        <div className="absolute right-10 top-10 w-20 h-20 bg-red-300/20 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('history.recentActivity')}</h3>
      </div>

      {/* Sessions List */}
      <div className="space-y-4 px-2 flex-1">
        {historyItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <p className="text-slate-500 font-medium mb-2">{t('history.noHistory')}</p>
            <p className="text-slate-400 text-sm">{t('history.startPracticing')}</p>
          </div>
        ) : (
          historyItems.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:border-red-200 hover:shadow-md transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${item.type === 'word' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {item.type === 'word' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors">{item.vocabText}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                  {item.type} <span className="mx-1 opacity-30">•</span> {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-black ${getScoreColor(item.overall)}`}>{Math.round(item.overall)}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {t('history.average_score')}: {Math.round(item.averageOverallScore)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={onStartTraining}
        className="fixed bottom-28 right-8 md:bottom-12 md:right-12 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-200 hover:scale-110 active:scale-95 hover:bg-red-600 transition-all z-40"
      >
        <Icons.MicFloating />
      </button>
    </div>
  );
};

const getIconBg = (type: string) => {
  switch (type) {
    case 'pronunciation': return 'bg-red-50 text-red-500';
    case 'tone': return 'bg-orange-50 text-orange-500';
    case 'vocabulary': return 'bg-red-50 text-red-500';
    case 'listening': return 'bg-slate-50 text-slate-500';
    default: return 'bg-slate-50 text-slate-400';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-red-500';
  if (score >= 80) return 'text-orange-500';
  return 'text-slate-600';
}

const renderIcon = (type: string) => {
  switch (type) {
    case 'pronunciation': return <Icons.Voice />;
    case 'tone': return <Icons.Voice />;
    case 'vocabulary': return <Icons.Book />;
    case 'listening': return <Icons.Headphones />;
    default: return <Icons.Message />;
  }
}

export default History;
