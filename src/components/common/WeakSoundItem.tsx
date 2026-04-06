import React from 'react';

interface WeakSoundItemProps {
  sound: {
    word: string;
    accuracy: number;
    level: 1 | 2 | 3; // 1: <75, 2: <65, 3: <50
  };
}

const WeakSoundItem: React.FC<WeakSoundItemProps> = ({ sound }) => {
  const getBgColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-red-100 text-red-600'; // Most difficult < 50
      case 2: return 'bg-orange-100 text-orange-600'; // Medium < 65
      case 1: return 'bg-yellow-100 text-yellow-600'; // Light < 75
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${getBgColor(sound.level)}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
      </div>
      
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{sound.word}</h4>
      </div>
      
      <div className="text-right">
        <div className={`text-lg font-black ${sound.accuracy < 50 ? 'text-red-600' : sound.accuracy < 65 ? 'text-orange-600' : 'text-yellow-600'}`}>
          {Math.round(sound.accuracy)}%
        </div>
      </div>
    </div>
  );
};

export default WeakSoundItem;
