import React, { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { cloudStorageService } from '@/services/cloudStorageService';
import { AVAILABLE_AVATARS, getDashboardAvatarsForSet } from '@/constants';
import AvatarSelection from './AvatarSelection';
import { useTranslation } from '@/i18n';

interface LevelCompletionFlowProps {
  currentLevel: 0 | 8;
  avatarId: string;
  onComplete: () => void;
  userId: string | null;
  userName: string;
  isLoggedIn: boolean;
  initialStep?: 'name' | 'avatar' | 'message';
}

const LevelCompletionFlow: React.FC<LevelCompletionFlowProps> = ({ currentLevel, avatarId, onComplete, userId, userName, isLoggedIn, initialStep }) => {
  const [step, setStep] = useState<'name' | 'message' | 'saving_auto' | 'avatar'>(
    initialStep === 'avatar' ? 'avatar' : (initialStep === 'message' ? 'message' : (isLoggedIn ? 'saving_auto' : 'name'))
  );
  const [rankingName, setRankingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disabledAvatars, setDisabledAvatars] = useState<string[]>([]);
  const { t } = useTranslation();

  const [messageFrames, setMessageFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Before showing avatar selection, figure out which avatars are already level 0 or level 8
    const computeDisabledAvatars = async () => {
      const disabled: string[] = [];
      for (const avatar of AVAILABLE_AVATARS) {
        const levelData = await storageService.getUserLevel(avatar.id);
        if (levelData.currentLevel === 0 || levelData.currentLevel === 8) {
          disabled.push(avatar.id);
        }
      }
      setDisabledAvatars(disabled);
    };

    computeDisabledAvatars();
  }, []);

  const handleNameSubmit = async (autoName?: string) => {
    setIsSubmitting(true);
    const nameToSave = autoName || rankingName.trim() || `User_${Math.floor(Math.random() * 1000000)}`;
    try {
      const currentLevelData = await storageService.getUserLevel(avatarId);
      await storageService.updateUserLevel(avatarId, { rankingName: nameToSave });

      const actualUserId = userId || 'GUEST_' + Math.random().toString(36).substr(2, 9);
      
      const record = {
        userId: actualUserId,
        avatarId,
        rankingName: nameToSave,
        level: currentLevel,
        score: currentLevelData.lastScore || (currentLevel === 0 ? 0 : 100),
        timestamp: new Date().toISOString()
      };

      await cloudStorageService.saveRanking(record);
      
      setRankingName(nameToSave);
      setStep('message');
    } catch (error) {
      console.error('Failed to save ranking data', error);
      setRankingName(nameToSave);
      setStep('message');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 'saving_auto') {
      handleNameSubmit(userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step === 'message') {
      const allFrames = getDashboardAvatarsForSet(avatarId);
      if (currentLevel === 0) {
        // reverse order for level 0 per requirements
        setMessageFrames(allFrames.slice(0, 10).reverse());
      } else {
        setMessageFrames(allFrames.slice(70, 80));
      }
    }
  }, [step, currentLevel, avatarId]);

  useEffect(() => {
    if (step === 'message' && messageFrames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % messageFrames.length);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step, messageFrames]);

  const handleAvatarSelect = async (newAvatarId: string) => {
    if (disabledAvatars.includes(newAvatarId)) {
      return; 
    }
    await storageService.setSelectedAvatar(newAvatarId);
    onComplete();
  };

  if (step === 'saving_auto') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin"></div>
      </div>
    );
  }

  if (step === 'name') {
    const isLevel8 = currentLevel === 8;
    const title = isLevel8 ? '素晴らしい！' : '「奈落の底」発音やり直せ！';
    const bgColor = isLevel8 ? 'bg-amber-500' : 'bg-slate-900';
    const buttonBg = isLevel8 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700';

    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${bgColor} bg-opacity-95 backdrop-blur-sm transition-all duration-500`}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center transform scale-100 animate-in fade-in zoom-in duration-300">
          
          <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-slate-100 shadow-md bg-gradient-to-br from-red-50 to-orange-50">
            <img 
               src={`../assets/avatar/${avatarId}/dashboard/avatar_0${isLevel8 ? '79' : '09'}.png`} 
               alt="Completed Avatar"
               className="w-full h-full object-cover"
               onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <h2 className={`text-2xl font-black mb-2 ${isLevel8 ? 'text-amber-600' : 'text-rose-600'}`}>
            {title}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mb-6">
            [{isLevel8 ? '殿堂入り' : '奈落の底'}] {t('dashboard.enter_ranking_name')}
          </p>

          <input
            type="text"
            value={rankingName}
            onChange={(e) => setRankingName(e.target.value)}
            placeholder="Spartan User"
            maxLength={20}
            className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 focus:border-red-500 focus:outline-none text-center font-bold text-lg mb-6 transition-colors shadow-inner"
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            disabled={isSubmitting}
          />

          <button
            onClick={() => handleNameSubmit()}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-md active:scale-95 ${buttonBg}`}
          >
            {isSubmitting ? 'Saving...' : 'OK'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'message') {
    const isLevel8 = currentLevel === 8;
    const bgColor = isLevel8 ? 'bg-amber-500' : 'bg-slate-900';
    const buttonBg = isLevel8 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700';

    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${bgColor} bg-opacity-95 backdrop-blur-sm transition-all duration-500`}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center transform scale-100 animate-in fade-in zoom-in duration-300">
          
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-slate-100 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
            <img 
               src={messageFrames[currentFrame] || getDashboardAvatarsForSet(avatarId)[isLevel8 ? 75 : 5]} 
               alt="Animated Avatar"
               className="w-full h-full object-cover"
               style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          <div className="text-slate-700 font-bold mb-8 whitespace-pre-line text-left w-full text-sm leading-relaxed">
            {isLevel8 ? (
              <>
                <span className="text-xl text-amber-600 block mb-3 text-center">やったな！</span>
                {rankingName}の発音は素晴らしいので、遂に『殿堂入り』した{'\n'}
                これからも精進せよ
              </>
            ) : (
              <>
                {rankingName}は『奈落の底』に落ちた・・・{'\n'}
                もはや救いようがない・・・{'\n'}
                とはいわぬが、{'\n'}
                発音は基礎からやり直すべしだ{'\n\n'}
                学校や教材で習ってみてはいかがだろう？{'\n'}
                以下を参考にすべし{'\n'}
                （学校名）{'\n'}
                <a href="https://xxxxxxxxxxxxxx" className="text-blue-500 underline" target="_blank" rel="noreferrer">https://xxxxxxxxxxxxxx</a>
              </>
            )}
          </div>

          <button
            onClick={() => setStep('avatar')}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-md active:scale-95 ${buttonBg}`}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Avatar Selection
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
      <div className="sticky top-0 w-full p-4 bg-amber-50 text-amber-800 font-bold text-center z-10 shadow-sm border-b border-amber-100">
        {t('dashboard.choose_new_companion')}
      </div>
      <div className="flex-1">
        <AvatarSelection
          isFirstTime={true}
          onSelectAvatar={handleAvatarSelect}
          disabledAvatars={disabledAvatars}
        />
      </div>
    </div>
  );
};

export default LevelCompletionFlow;
