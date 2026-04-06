import React, { useEffect, useState } from 'react';
import { storageService } from '@/services/storageService';
import WeakSoundItem from '@/components/common/WeakSoundItem';
import { useTranslation } from '@/i18n';

interface WeakSoundsProps {
  onBack: () => void;
}

const WeakSounds: React.FC<WeakSoundsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [weakWords, setWeakWords] = useState<Array<{ word: string; accuracy: number; level: 1 | 2 | 3 }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeakWords = async () => {
      const data = await storageService.getWeakWords();
      setWeakWords(data);
      setLoading(false);
    };

    loadWeakWords();
  }, []);

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md py-4 z-10 px-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('dashboard.weakSounds')}
        </h2>
      </div>

      <div className="flex-1 px-2">
        {loading ? (
          <div className="text-center text-slate-400 py-10">{t('common.loading')}</div>
        ) : weakWords.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">{t('dashboard.noWeakSounds')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {weakWords.map((item, idx) => (
              <div 
                key={idx} 
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <WeakSoundItem sound={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeakSounds;
