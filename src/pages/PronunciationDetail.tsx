import React, { useState, useEffect, useRef } from 'react';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { checkPronunciationById, PronunciationResult, uploadAudioToCloud } from '@/services/api';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslation } from '@/i18n';
import { useToast } from '@/contexts/ToastContext';
import { storageService } from '@/services/storageService';
import { auth, analytics } from '@/services/firebase';
import { logEvent } from 'firebase/analytics';

interface PronunciationDetailProps {
  item: any;
  onBack: () => void;
  onContinue: (result: PronunciationResult) => void;
}

const PronunciationDetail: React.FC<PronunciationDetailProps> = ({
  item,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const hasRecordingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVocabPlaying, setIsVocabPlaying] = useState(false);
  
  const { showLoading, hideLoading } = useLoading();

  const mountedRef = useRef(true);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const stopRecordingHandlerRef = useRef<(autoSubmit?: boolean) => Promise<void>>(undefined);
  const recordingStartTimeRef = useRef<number>(0);
  
  // Ensure consistent string ID for all recording operations
  const recordingId = String(item.id);

  /* ===================== INIT ===================== */

  useEffect(() => {
    mountedRef.current = true;

    const checkRecording = async () => {
      const blob = await audioRecordingService.getRecording(recordingId);
      if (mountedRef.current) {
        hasRecordingRef.current = blob !== null;
      }
    };

    checkRecording();

    return () => {
      mountedRef.current = false;
      audioRecordingService.stopPlayback();
    };
  }, [recordingId]);

  /* ===================== RECORD ===================== */

  const startRecording = async () => {
    try {
      if (isPlaying) {
        audioRecordingService.stopPlayback();
        setIsPlaying(false);
      }
      if (isVocabPlaying && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        setIsVocabPlaying(false);
      }

      await audioRecordingService.startRecording();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      
      // Log event to Firebase Analytics
      if (analytics) {
        logEvent(analytics, 'training');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('pronunciation.error_recording'), 'error');
    }
  };

  const handleStopRecording = async (autoSubmit: boolean = false) => {
    if (!isRecording) return;

    try {
      await audioRecordingService.stopRecording(recordingId);
      setIsRecording(false);
      hasRecordingRef.current = true;
      
      // Track practice statistics - calculate accurately from button press to stop
      const endTime = Date.now();
      const duration = (endTime - recordingStartTimeRef.current) / 1000;
      console.log(`⏱️ Recording duration: ${duration.toFixed(2)}s`);
      
      await storageService.incrementPracticeSession(duration);

      if (autoSubmit) {
        // Short delay to ensure blob is processed and state is updated
        setTimeout(() => {
          handleContinue();
        }, 300);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  // Keep the ref updated with the latest handler
  useEffect(() => {
    stopRecordingHandlerRef.current = handleStopRecording;
  }, [handleStopRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording(true);
    } else {
      startRecording();
    }
  };

  /* ===================== PLAYBACK ===================== */

  const playRecording = async () => {
    if (isRecording) return;

    const success = await audioRecordingService.playRecording(recordingId, () => {
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    });

    if (success) {
      setIsPlaying(true);
    } else {
      showToast(t('pronunciation.error_no_recording'), 'warning');
    }
  };

  const stopPlaying = () => {
    audioRecordingService.stopPlayback();
    setIsPlaying(false);
  };

  /* ===================== SUBMIT ===================== */

  const handleContinue = async () => {
    if (!hasRecordingRef.current) {
      showToast(t('pronunciation.error_continue_no_recording'), 'warning');
      return;
    }

    showLoading(t('pronunciation.analyzing'));

    try {
      const result = await checkPronunciationById(recordingId, item.vi);
      console.log('Pronunciation result:', result);
      
      // If user is logged in, upload the audio to S3
      const user = auth.currentUser;
      if (user) {
        const blob = await audioRecordingService.getRecording(recordingId);
        if (blob) {
          const fileName = `users/${user.uid}/${item.id}_${Date.now()}.wav`;
          const fileUrl = await uploadAudioToCloud(blob, fileName);
          if (fileUrl) {
            result.audioUrl = fileUrl;
            console.log('✅ Uploaded to S3:', fileUrl);
          }
        }
      }

      // Save result to IndexedDB
      await storageService.savePronunciationResult(item.id, result);
      
      // Update daily average score
      if (result.score.overall !== undefined) {
        await storageService.updateDailyScore(result.score.overall);
      }
      
      hideLoading();
      // Pass result to next screen
      onContinue(result);
    } catch (error) {
      hideLoading();
      console.error('Error checking pronunciation:', error);
      showToast(t('pronunciation.error_submit'), 'error');
    }
  };

  /* ===================== AUDIO PLAYBACK ===================== */

  const handlePlayAudio = () => {
    if (isVocabPlaying && audioPlayerRef.current) {
      // Stop playing
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsVocabPlaying(false);
    } else {
      // Stop user recording playback if active
      if (isPlaying) {
        stopPlaying();
      }

      // Start playing — pick a random speaker (1–4) based on item type
      const speaker = Math.floor(Math.random() * 4) + 1;
      const folder = item.type === 'phrase' ? 'phase' : 'word';
      const prefix = item.type === 'phrase' ? 'phase' : 'word';
      // Strip prefix from ID (e.g. 'wt1-1' → '1', 'pt2-10' → '10')
      const numericId = String(item.id).replace(/^[a-z0-9]+-/, '');
      const stagePath = item.stage ? `stage${item.stage}` : 'stage1';
      const audioPath = `/audio/${folder}/${stagePath}/${prefix}-${speaker}-${numericId}.mp3`;

      // Always create a new Audio instance so the correct random path is used
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onerror = null;
      }
      audioPlayerRef.current = new Audio(audioPath);
      audioPlayerRef.current.onended = () => setIsVocabPlaying(false);
      audioPlayerRef.current.onerror = () => {
        console.error(`Failed to load audio: ${audioPath}`);
        showToast('Audio file not found', 'error');
        setIsVocabPlaying(false);
      };
      
      audioPlayerRef.current.play()
        .then(() => setIsVocabPlaying(true))
        .catch(err => {
          console.error('Error playing audio:', err);
          showToast('Failed to play audio', 'error');
          setIsVocabPlaying(false);
        });
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md py-4 z-10 px-2">
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
          {t('pronunciation.pronunciation')}
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Main Card */}
        <div className="w-full bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm flex flex-col items-center text-center mb-10">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h3 className="text-4xl font-extrabold text-slate-900 mb-2">
            {item.vi}
          </h3>
          <p className="text-xl font-semibold text-slate-500 mb-1">
            {item.en || 'Hello everyone'}
          </p>
          <p className="text-slate-400 font-medium">{item.jp}</p>
        </div>

        {/* Secondary Buttons */}
        <div className="flex justify-center w-full mb-16">
          <button
            onClick={handlePlayAudio}
            className="py-4 px-10 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95 shadow-sm"
          >
            {isVocabPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
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
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
            {isVocabPlaying ? t('pronunciation.stop') : t('pronunciation.play')}
          </button>
        </div>

        {/* Record Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ripple-small" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-red-300 animate-ripple-small"
                  style={{ animationDelay: '0.4s' }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-red-300 animate-ripple-small"
                  style={{ animationDelay: '0.8s' }}
                />
              </>
            )}

            <button
              onClick={toggleRecording}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-200 hover:scale-105 active:scale-95 transition-all ${
                isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500'
              }`}
            >
              {isRecording ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            {isRecording
              ? t('pronunciation.recording_status_recording')
              : hasRecordingRef.current
              ? t('pronunciation.recording_status_complete')
              : t('pronunciation.recording_status_tap')}
          </p>
      </div>
    </div>
  </div>
  );
};

export default PronunciationDetail;
