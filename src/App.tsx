import React, { useState } from 'react';
import { AppTab } from '@/types';
import { PronunciationResult as PronunciationResultType } from '@/services/api';
import { VocabType, storageService } from '@/services/storageService';
import { auth } from '@/services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { audioRecordingService } from '@/services/AudioRecordingService';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/pages/Dashboard';
import TrainingModes from '@/pages/TrainingModes';
import VocabularyList from '@/pages/VocabularyList';
import StageSelection from '@/pages/StageSelection';
import PronunciationDetail from '@/pages/PronunciationDetail';
import PronunciationResult from '@/pages/PronunciationResult';
import Settings from '@/pages/Settings';
import History from '@/pages/History';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import WeakSounds from '@/pages/WeakSounds';
import AvatarSelection from '@/pages/AvatarSelection';
import LevelCompletionFlow from '@/pages/LevelCompletionFlow';
import Ranking from '@/pages/Ranking';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';

enum LessonFlow {
  MODES = 'MODES',
  STAGES = 'STAGES',
  VOCAB = 'VOCAB',
  PRONUNCIATION = 'PRONUNCIATION',
  RESULT = 'RESULT'
}

type AuthScreen = 'login' | 'register' | null;

const App: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [lessonFlow, setLessonFlow] = useState<LessonFlow>(LessonFlow.MODES);
  const [previousFlow, setPreviousFlow] = useState<LessonFlow | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResultType | null>(null);
  const [selectedVocabType, setSelectedVocabType] = useState<VocabType>('word');
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [isRandom, setIsRandom] = useState(false);
  const [vocabItems, setVocabItems] = useState<any[]>([]);
  const [practicedIds, setPracticedIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar1');
  const [isFirstTimeLaunch, setIsFirstTimeLaunch] = useState(false);
  const [completionFlowData, setCompletionFlowData] = useState<{level: 0 | 8, avatarId: string, initialStep?: 'name' | 'avatar'} | null>(null);

  // Auth state listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Data wiping is now handled explicitly in Login/Register/Logout actions to prevent sync race conditions

      setCurrentUser(user);
      storageService.setUserId(user ? user.uid : null);
      setIsAuthReady(true);
      
      // If user logs out, we might want to clear some local cache or redirect
      if (!user && (activeTab === AppTab.SETTINGS || activeTab === AppTab.HISTORY)) {
        // Stay on settings but some info will disappear
      }
    });

    return () => unsubscribe();
  }, []);

  // Load random mode preference
  React.useEffect(() => {
    storageService.getIsRandom().then(setIsRandom);
  }, []);

  // Check avatar selection on mount, only AFTER auth is ready
  React.useEffect(() => {
    if (!isAuthReady) return;

    const checkAvatarSelection = async () => {
      const hasSelected = await storageService.hasCompletedAvatarSelection();
      if (!hasSelected) {
        setIsFirstTimeLaunch(true);
      } else {
        const avatar = await storageService.getSelectedAvatar();
        const currentAvatarId = avatar || 'avatar1';
        console.log('currentAvatarId', currentAvatarId);
        setSelectedAvatar(currentAvatarId);

        // Check if this avatar has hit level 0 or level 8
        const levelData = await storageService.getUserLevel(currentAvatarId);
        if (levelData.currentLevel === 0 || levelData.currentLevel === 8) {
          setCompletionFlowData({ 
            level: levelData.currentLevel as 0 | 8, 
            avatarId: currentAvatarId,
            initialStep: levelData.rankingName ? 'avatar' : 'name'
          });
        }
      }
    };
    // Also check whenever activeTab is set back to HOME
    if (activeTab === AppTab.HOME) {
      checkAvatarSelection();
    }
  }, [activeTab, isAuthReady]);

  const handleRandomToggle = async () => {
    const newValue = !isRandom;
    setIsRandom(newValue);
    await storageService.setIsRandom(newValue);
  };

  const handleAvatarSelect = async (avatarId: string) => {
    await storageService.setSelectedAvatar(avatarId);
    setSelectedAvatar(avatarId);
    setIsFirstTimeLaunch(false);
    setActiveTab(AppTab.HOME); // Navigate to Dashboard
  };

  // Handle vocabulary item selection with completion check
  const handleVocabItemSelect = async (item: any) => {
    setSelectedItem(item);
    
    // Check if item has saved pronunciation result
    const savedResult = await storageService.getPronunciationResult(item.id);
    
    if (savedResult) {
      // Item is completed - go directly to result screen from vocab list
      setPreviousFlow(LessonFlow.VOCAB);
      setPronunciationResult(savedResult.response);
      setLessonFlow(LessonFlow.RESULT);
    } else {
      // Item not completed - go to pronunciation screen
      setPreviousFlow(LessonFlow.VOCAB);
      setLessonFlow(LessonFlow.PRONUNCIATION);
    }
  };

  const handleExploreNext = () => {
    if (!selectedItem || vocabItems.length === 0) {
      setLessonFlow(LessonFlow.VOCAB);
      return;
    }

    const currentIds = new Set(practicedIds);
    currentIds.add(selectedItem.id);
    setPracticedIds(currentIds);

    const currentIndex = vocabItems.findIndex(item => item.id === selectedItem.id);
    
    // Determine if this is the last item based on current mode
    let isLast = false;
    if (isRandom) {
      isLast = currentIds.size >= vocabItems.length;
    } else {
      isLast = currentIndex >= vocabItems.length - 1;
    }

    if (isLast) {
      setPronunciationResult(null);
      setLessonFlow(LessonFlow.VOCAB);
      return;
    }

    let nextItem = null;
    if (isRandom) {
      const remainingItems = vocabItems.filter(item => !currentIds.has(item.id));
      if (remainingItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingItems.length);
        nextItem = remainingItems[randomIndex];
      }
    } else {
      if (currentIndex < vocabItems.length - 1) {
        nextItem = vocabItems[currentIndex + 1];
      }
    }

    if (nextItem) {
      setSelectedItem(nextItem);
      setPronunciationResult(null);
      setLessonFlow(LessonFlow.PRONUNCIATION);
    } else {
      setPronunciationResult(null);
      setLessonFlow(LessonFlow.VOCAB);
    }
  };

  const renderLessonsFlow = () => {
    switch (lessonFlow) {
      case LessonFlow.MODES:
        return <TrainingModes onStart={(type) => {
          setSelectedVocabType(type);
          setLessonFlow(LessonFlow.STAGES);
        }} />;
      case LessonFlow.STAGES:
        return <StageSelection
          vocabType={selectedVocabType}
          onSelect={(stage) => {
            setSelectedStage(stage);
            setPracticedIds(new Set());
            setVocabItems([]);
            setLessonFlow(LessonFlow.VOCAB);
          }}
          onBack={() => setLessonFlow(LessonFlow.MODES)}
        />;
      case LessonFlow.VOCAB:
        return (
          <VocabularyList 
            vocabType={selectedVocabType}
            stage={selectedStage}
            onBack={() => setLessonFlow(LessonFlow.STAGES)} 
            onSelectItem={handleVocabItemSelect}
            onItemsLoaded={setVocabItems}
          />
        );
      case LessonFlow.PRONUNCIATION:
        return (
          <PronunciationDetail 
            item={selectedItem}
            onBack={() => setLessonFlow(LessonFlow.VOCAB)}
            onContinue={(result) => {
              setPreviousFlow(LessonFlow.PRONUNCIATION);
              setPronunciationResult(result);
              setLessonFlow(LessonFlow.RESULT);
            }}
          />
        );
      case LessonFlow.RESULT:
        return (
          <PronunciationResult 
            item={selectedItem}
            result={pronunciationResult}
            recordingId={String(selectedItem?.id)}
            onBack={() => {
              // Go back to the previous screen (VOCAB or PRONUNCIATION)
              if (previousFlow === LessonFlow.VOCAB) {
                setLessonFlow(LessonFlow.VOCAB);
              } else {
                setLessonFlow(LessonFlow.PRONUNCIATION);
              }
            }}
            onRetry={() => {
              setPronunciationResult(null);
              setLessonFlow(LessonFlow.PRONUNCIATION);
            }}
            onContinue={handleExploreNext}
            isRandom={isRandom}
            onRandomToggle={handleRandomToggle}
            avatarId={selectedAvatar}
            isLastItem={isRandom 
              ? practicedIds.size + 1 >= vocabItems.length 
              : vocabItems.findIndex(i => i.id === selectedItem?.id) >= vocabItems.length - 1
            }
          />
        );

      default:
        return <TrainingModes onStart={() => setLessonFlow(LessonFlow.VOCAB)} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
          <Dashboard 
            onStartTraining={() => {
              setActiveTab(AppTab.TRAINING);
              setLessonFlow(LessonFlow.MODES);
            }} 
            onViewAllWeakSounds={() => setActiveTab(AppTab.WEAK_SOUNDS)}
            currentUser={currentUser}
            onLoginClick={() => setAuthScreen('login')}
          />
        );
      case AppTab.TRAINING:
        return renderLessonsFlow();
      case AppTab.HISTORY:
        return <History onStartTraining={() => setActiveTab(AppTab.TRAINING)} />;
      case AppTab.WEAK_SOUNDS:
        return <WeakSounds onBack={() => setActiveTab(AppTab.HOME)} />;
      case AppTab.RANKING:
        return <Ranking />;
      case AppTab.SETTINGS:
        return (
          <Settings 
            onLoginClick={() => setAuthScreen('login')} 
            currentUser={currentUser}
          />
        );
      case AppTab.AVATAR_SELECTION:
        return (
          <AvatarSelection
            isFirstTime={false}
            currentAvatarId={selectedAvatar}
            onSelectAvatar={handleAvatarSelect}
            onBack={() => setActiveTab(AppTab.SETTINGS)}
          />
        );
      default:
        return (
          <Dashboard 
            onStartTraining={() => setActiveTab(AppTab.TRAINING)} 
            onViewAllWeakSounds={() => setActiveTab(AppTab.WEAK_SOUNDS)}
            currentUser={currentUser}
            onLoginClick={() => setAuthScreen('login')}
          />
        );
    }
  };

  // Prevent flashing UI before auth resolves
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin"></div>
      </div>
    );
  }

  // If showing auth screens, render them exclusively (no main layout behind)
  if (authScreen === 'login') {
    return (
      <Login 
        onLogin={() => setAuthScreen(null)} 
        onSignUpClick={() => setAuthScreen('register')}
        onBack={() => setAuthScreen(null)} 
      />
    );
  }

  if (authScreen === 'register') {
    return (
      <Register 
        onRegister={() => setAuthScreen(null)}
        onSignInClick={() => setAuthScreen('login')}
        onBack={() => setAuthScreen('login')}
      />
    );
  }

  // First-time avatar selection (blocks app until completed)
  if (isFirstTimeLaunch) {
    return (
      <AvatarSelection
        isFirstTime={true}
        onSelectAvatar={handleAvatarSelect}
      />
    );
  }

  // Level 0 / 8 block screen
  if (completionFlowData) {
    return (
      <LevelCompletionFlow
        currentLevel={completionFlowData.level}
        avatarId={completionFlowData.avatarId}
        userId={currentUser?.uid || null}
        userName={currentUser?.displayName || currentUser?.email?.split('@')[0] || `User_${Math.floor(Math.random() * 1000000)}`}
        isLoggedIn={!!currentUser}
        initialStep={completionFlowData.initialStep}
        onComplete={() => {
          setCompletionFlowData(null);
          // Must have selected a new avatar inside the flow, so re-trigger check or hard reload state
          storageService.getSelectedAvatar().then(av => setSelectedAvatar(av || 'avatar1'));
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Navigation Sidebar (Web Version) */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === AppTab.TRAINING) setLessonFlow(LessonFlow.MODES);
        }} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-40 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-full">
          {renderContent()}
        </div>

        {/* Mobile Navigation (Floating Bottom Bar) */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-card rounded-2xl shadow-2xl p-4 flex justify-around items-center z-50">
          <NavItem 
            icon="Home" 
            label={t('nav.home')} 
            active={activeTab === AppTab.HOME} 
            onClick={() => {
              setActiveTab(AppTab.HOME);
            }} 
          />
          <NavItem 
            icon="Book" 
            label={t('nav.training')} 
            active={activeTab === AppTab.TRAINING} 
            onClick={() => {
              setActiveTab(AppTab.TRAINING);
              setLessonFlow(LessonFlow.MODES);
            }} 
          />
          <NavItem icon="History" label={t('nav.history')} active={activeTab === AppTab.HISTORY} onClick={() => setActiveTab(AppTab.HISTORY)} />
          <NavItem icon="Trophy" label={t('nav.ranking')} active={activeTab === AppTab.RANKING} onClick={() => setActiveTab(AppTab.RANKING)} />
          <NavItem icon="Settings" label={t('nav.settings')} active={activeTab === AppTab.SETTINGS} onClick={() => setActiveTab(AppTab.SETTINGS)} />
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => {
  const Icon = (Icons as any)[icon];
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-red-500' : 'text-slate-400'}`}
    >
      <Icon />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default App;
