import React from 'react';
import { Word } from '@/services/api';
import { getWordColor } from '@/utils/utils';

interface PronunciationTextProps {
  words: Word[];
  highlightedIndex?: number;
}

export function PronunciationText({ 
  words, 
  highlightedIndex = -1 
}: PronunciationTextProps) {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2">
      {words.map((w, idx) => {
        const score = w.PronunciationAssessment?.AccuracyScore ?? 0;
        const isHighlighted = idx === highlightedIndex;
        
        return (
          <span
            key={idx}
            className={`text-2xl transition-all duration-200 ${
              isHighlighted ? 'scale-110 shadow-md' : ''
            }`}
            style={{
              color: getWordColor(score),
              fontWeight: 700,
              backgroundColor: isHighlighted ? '#FFD700' : 'transparent',
              paddingLeft: isHighlighted ? 8 : 0,
              paddingRight: isHighlighted ? 8 : 0,
              paddingTop: isHighlighted ? 4 : 0,
              paddingBottom: isHighlighted ? 4 : 0,
              borderRadius: isHighlighted ? 6 : 0,
            }}
          >
            {w.Word}
          </span>
        );
      })}
    </div>
  );
}

export default PronunciationText;
