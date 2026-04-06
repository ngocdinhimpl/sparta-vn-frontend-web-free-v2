import React, { useState } from 'react';
import { PronunciationResult as PronunciationResultType } from '@/services/api';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { useAvatar } from '@/features/avatar/useAvatar';
import { playWithAvatar } from '@/features/pronunciation/playWithAvatar';
import { parseWords, getAvatarFromScore } from '@/utils/utils';
import { PronunciationText } from '@/components/pronunciation/PronunciationText';
import { getCoachAvatar } from '@/constants';
import { useTranslation } from '@/i18n';
import { auth } from '@/services/firebase';
import { storageService } from '@/services/storageService';

interface PronunciationResultProps {
  item: any;
  result: PronunciationResultType | null;
  recordingId: string;
  onContinue: () => void;
  onRetry: () => void;
  onBack: () => void;
  isRandom: boolean;
  onRandomToggle: () => void;
  avatarId: string;
  isLastItem?: boolean;
}

const ScoreBadge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-[#F8FAFC] rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-50 transition-all hover:scale-105 shadow-sm">
    <span className={`text-2xl font-black ${color}`}>{Math.round(value)}</span>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center whitespace-nowrap">{label}</span>
  </div>
);

const PronunciationResult: React.FC<PronunciationResultProps> = ({ 
  item, 
  result,
  recordingId,
  onContinue, 
  onRetry, 
  onBack,
  isRandom,
  onRandomToggle,
  avatarId,
  isLastItem = false
}) => {
  const { t } = useTranslation();
  const overallScore = result?.score?.overall ?? 0;
  
  const initialMood = React.useMemo(() => {
    return getAvatarFromScore(overallScore);
  }, [overallScore]);

  const { image, controller } = useAvatar(initialMood, avatarId);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  React.useEffect(() => {
    controller.setInitialMood(initialMood);
  }, [initialMood, controller]);

  // Fetch pronunciation result data (works for both logged-in and guest users)
  React.useEffect(() => {
    const fetchData = async () => {
      if (!item?.id) return;

      try {
        // Get pronunciation result from storage (Firebase for logged-in, IndexedDB for guest)
        const result = await storageService.getPronunciationResult(item.id);
        console.log('result', result);
        // Set average score for comparison
        if (result?.averageOverallScore !== undefined) {
          setAverageScore(result.averageOverallScore);
        }
        
        // If user logged in from another device/re-login, the local blob is gone.
        // Re-download from cloud if there is an audioUrl
        const cloudAudioUrl = result?.audioUrl || result?.response?.audioUrl;
        if (cloudAudioUrl) {
          try {
            const existingBlob = await audioRecordingService.getRecording(recordingId);
            if (!existingBlob) {
              console.log(`🔽 Pre-downloading audio for ${item.id} from cloud...`);
              await audioRecordingService.downloadAudioFromUrl(recordingId, cloudAudioUrl);
            }
          } catch (e) {
            console.error('Could not download audio from cloud:', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [item?.id, recordingId]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      audioRecordingService.stopPlayback();
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
      return;
    }

    try {
      setHighlightedWordIndex(-1);
      setIsPlaying(true);
      
      const success = await audioRecordingService.playRecording(
        recordingId, 
        () => {
          setIsPlaying(false);
          setHighlightedWordIndex(-1);
        }
      );

      if (!success) {
        setIsPlaying(false);
        return;
      }
      
      if (result?.words) {
        const words = parseWords(result.words);
        playWithAvatar(words, controller, 0, (index) => {
          setHighlightedWordIndex(index);
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return t('pronunciation.score_perfect');
    if (score >= 80) return t('pronunciation.score_great');
    if (score >= 65) return t('pronunciation.score_good');
    return t('pronunciation.score_keep_practicing');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 65) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md py-4 z-10 px-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{t('pronunciation.result')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Success Message */}
        <div className="text-center mb-6">
          <h1 className={`text-5xl font-black mb-2 animate-bounce ${getScoreColor(overallScore)}`}>
            {getScoreMessage(overallScore)}
          </h1>
        </div>

        {/* Avatar with animation */}
        <div className="mb-6 w-64 h-64 bg-white/40 rounded-3xl flex items-center justify-center p-4 relative">
          <div className={`absolute inset-0 rounded-full blur-3xl animate-pulse ${
            overallScore >= 80 ? 'bg-emerald-100/30' : 
            overallScore >= 65 ? 'bg-orange-100/30' : 
            'bg-red-100/30'
          }`}></div>
          <img 
            src={image || getCoachAvatar(avatarId)}
            alt="Avatar"
            className="w-full h-full object-contain drop-shadow-2xl relative z-10"
          />
        </div>

        {/* Detailed Scores Grid */}
        <div className="grid grid-cols-4 gap-3 w-full mb-8">
          <ScoreBadge label={t('pronunciation.overall')} value={overallScore} color={getScoreColor(overallScore)} />
          <ScoreBadge label={t('pronunciation.accuracy_score')} value={result?.score?.accuracy ?? 0} color="text-orange-500" />
          <ScoreBadge label={t('pronunciation.fluency')} value={result?.score?.fluency ?? 0} color="text-emerald-500" />
          <ScoreBadge label={t('pronunciation.completeness')} value={result?.score?.completeness ?? 0} color="text-blue-500" />
        </div>

        {/* Average Comparison Indicator */}
        {averageScore !== null && (
          <div className="w-full mb-8 px-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${overallScore >= averageScore ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('pronunciation.avg_score')}: {Math.round(averageScore)}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                overallScore >= averageScore 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-amber-600 bg-amber-50'
              }`}>
                {overallScore >= averageScore ? '+' : ''}{Math.round(overallScore - averageScore)}% 
                {overallScore >= averageScore 
                  ? t('pronunciation.above_average') 
                  : t('pronunciation.below_average')
                }
              </span>
            </div>
          </div>
        )}

        {/* Result Card */}
        <div className="w-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center mb-10">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-3">
              {overallScore >= 80 && (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-100 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
              <div className="text-3xl font-extrabold text-slate-900">
                {result?.words ? (
                  <PronunciationText 
                    words={result.words} 
                    highlightedIndex={highlightedWordIndex}
                  />
                ) : (
                  item.vi
                )}
              </div>
            </div>
            <p className="text-slate-500 font-bold text-lg">{item.jp}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={handlePlayAudio}
              className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm ${
                isPlaying 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  {t('pronunciation.stop')}
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                  {t('pronunciation.play')}
                </>
              )}
            </button>
            <button 
              onClick={onRetry}
              className="py-4 px-6 bg-[#F8FAFC] text-[#64748B] rounded-2xl font-bold border border-slate-100 flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-sm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              {t('pronunciation.retry')}
            </button>
          </div>
        </div>
      </div>

      {/* Random Toggle Control */}
      <div className="flex items-center justify-center gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isRandom}
              onChange={onRandomToggle}
            />
            <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${isRandom ? 'bg-red-500' : 'bg-slate-200'}`}></div>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform ${isRandom ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${isRandom ? 'text-red-500' : 'text-slate-400'}`}>
            {isRandom ? t('pronunciation.randomModeOn') : t('pronunciation.randomModeOff')}
          </span>
        </label>
        <div className="h-4 w-px bg-slate-200"></div>
        <p className="text-[10px] text-slate-400 font-bold">
          {isRandom ? t('pronunciation.randomModeDescOn') : t('pronunciation.randomModeDescOff')}
        </p>
      </div>

      <button 
        onClick={onContinue}
        className="w-full py-5 bg-red-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-100 active:scale-[0.98]"
      >
        {isLastItem ? t('common.finish') : t('common.continue')}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {isLastItem ? (
            <polyline points="20 6 9 17 4 12"/>
          ) : (
            <>
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </>
          )}
        </svg>
      </button>
    </div>
  );
};

export default PronunciationResult;
