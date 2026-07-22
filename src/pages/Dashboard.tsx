import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SOUNDS_DATA, Icons } from '@/constants';
import { Stat } from '@/types';
import StatCard from '@/components/common/StatCard';
import CoachCard from '@/components/features/CoachCard';
import WeakSoundItem from '@/components/common/WeakSoundItem';
import { useTranslation } from '@/i18n';
import { storageService } from '@/services/storageService';
import { auth } from '@/services/firebase';
import { User } from 'firebase/auth';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { useDashboardAvatar } from '@/hooks/useDashboardAvatar';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import TutorialModal from '@/components/TutorialModal';

interface DashboardProps {
  onStartTraining: () => void;
  onViewAllWeakSounds: () => void;
  currentUser: User | null;
  onLoginClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartTraining, onViewAllWeakSounds, currentUser, onLoginClick }) => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<Array<{ day: string; score: number }>>([]);
  const [weakWords, setWeakWords] = useState<Array<{ word: string; accuracy: number; level: 1 | 2 | 3 }>>([]);
  const [shouldAnimateScore, setShouldAnimateScore] = useState(false);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Avatar animation hook
  const { currentAvatarImage, currentLevel } = useDashboardAvatar();
  
  // Animate score number from 0 to today's average after loading
  const todayScore = weeklyScores.length > 0 ? weeklyScores[weeklyScores.length - 1].score : 0;
  const animatedScore = useAnimatedNumber({
    from: 0,
    to: shouldAnimateScore ? Math.round(todayScore) : 0,
    duration: 2000,
    startDelay: 300,
  });
  

  useEffect(() => {
    // Only show prompt if not logged in and this is NOT the very first mount of the dashboard in this session
    if (!currentUser && sessionStorage.getItem('dashboard_mounted') === 'true') {
      setShowBackupPrompt(true);
    }
    sessionStorage.setItem('dashboard_mounted', 'true');

    if (!localStorage.getItem('has_seen_tutorial')) {
      setShowTutorial(true);
    }

    const loadStats = async () => {
      setLoading(true); // Show skeleton while loading
      
      const stats = await storageService.getPracticeStats();
      
      // Helper function to format duration intelligently
      const formatDuration = (seconds: number): { value: string; unit: string } => {
        const MINUTE = 60;
        const HOUR = 60 * 60;
        const DAY = 24 * 60 * 60;
        const MONTH = 30 * 24 * 60 * 60; // Approximate
        
        if (seconds < MINUTE) {
          return { value: String(Math.floor(seconds)), unit: t('common.seconds') };
        } else if (seconds < HOUR) {
          return { value: String(Math.floor(seconds / MINUTE)), unit: t('common.minutes') };
        } else if (seconds < DAY) {
          return { value: String(Math.floor(seconds / HOUR)), unit: t('common.hours') };
        } else if (seconds < MONTH) {
          return { value: String(Math.floor(seconds / DAY)), unit: t('common.days') };
        } else {
          return { value: String(Math.floor(seconds / MONTH)), unit: t('common.months') };
        }
      };
      
      const activeDuration = formatDuration(stats.totalDurationSeconds);
      
      // Convert practice stats to UI format
      const formattedStats: Stat[] = [
        {
          label: t('dashboard.stat_sessions'), 
          value: String(stats.totalSessions), 
          colorClass: 'text-red-500' 
        },
        {
          label: t('dashboard.stat_streak'), 
          value: String(stats.streakDays), 
          icon: '🔥', 
          colorClass: 'text-orange-500'
        },
        {
          label: t('dashboard.stat_active'), 
          value: activeDuration.value, 
          unit: activeDuration.unit, 
          colorClass: 'text-slate-800' 
        }
      ];
      
      setStatsData(formattedStats);
      
      // Load weekly scores (last 7 days)
      const weeklyData: Array<{ day: string; score: number }> = [];
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = daysOfWeek[date.getDay()];
        
        const dailyScore = await storageService.getDailyScore(dateString);
        weeklyData.push({
          day: dayName,
          score: dailyScore?.averageScore || 0,
        });
      }
      
      setWeeklyScores(weeklyData);
      
      // Load weak words
      const weakWordsData = await storageService.getWeakWords();
      setWeakWords(weakWordsData.slice(0, 3)); // Top 3 weak words
      
      setLoading(false);
      
      // Trigger score animation after loading screen is hidden
      setTimeout(() => {
        setShouldAnimateScore(true);
      }, 100); // Small delay to ensure UI has rendered
    };

    loadStats();
  }, [currentUser]); // Re-fetch when auth state changes


  const averageValue = weeklyScores.length > 0 
    ? weeklyScores.reduce((acc, curr) => acc + curr.score, 0) / weeklyScores.length 
    : 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex justify-between items-center sm:block">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('dashboard.title')}</h2>
            {currentUser && (
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                {t('dashboard.welcome')}, {currentUser.displayName || currentUser.email}
              </p>
            )}
          </div>
          
          {/* Avatar for mobile only (shown here when stacked) */}
          <div className="sm:hidden">
            {currentUser && (
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg shadow-red-100">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 md:gap-6">
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-red-100 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
              <div className="text-red-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
              <span className="text-sm sm:text-base font-black text-red-600">Lv.{currentLevel}</span>
              <span className="text-[9px] font-black text-red-400 uppercase tracking-wider ml-1">Level</span>
            </div>
          </div>
          
          {/* Avatar for desktop */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg shadow-red-100 group-hover:scale-105 transition-transform">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Featured Content */}
        <div className="lg:col-span-8 space-y-8">
          <CoachCard name="Linh Nguyen" avatarImage={currentAvatarImage} />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center text-slate-400">Loading...</div>
            ) : (
              statsData.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))
            )}
          </div>

          <div className="bg-red-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-red-200">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">{t('dashboard.readyToChallenge')}</h3>
              <p className="text-red-50 opacity-90 max-w-md mb-6">{t('dashboard.improveAccuracy')}</p>
              <button 
                onClick={onStartTraining}
                className="px-8 py-4 bg-white text-red-600 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {t('dashboard.startTraining')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-400/30 rounded-full blur-3xl"></div>
            <div className="absolute right-20 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Right Column - Sound Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-slate-800">{t('dashboard.weakSounds')}</h3>
            <button 
              onClick={onViewAllWeakSounds}
              className="text-red-500 text-sm font-bold hover:underline"
            >
              {t('common.viewAll')}
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-slate-400 py-4">{t('common.loading')}</div>
            ) : weakWords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No weak sounds yet</p>
              </div>
            ) : (
              weakWords.map((item, idx) => (
                <WeakSoundItem key={idx} sound={item} />
              ))
            )}
          </div>

          {/* Weekly Progress with Peak Connection Line */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mt-8">
             <div className="flex justify-between items-center mb-6">
               <h4 className="font-bold text-slate-800">{t('dashboard.weeklyProgress')}</h4>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                 Average: {Math.round(averageValue)}%
               </span>
             </div>
             
             <div className="relative h-40 group">
                {/* Trend line connecting the peaks */}
                <svg 
                  className="absolute inset-0 w-full h-full z-10 pointer-events-none" 
                  viewBox={`0 0 ${weeklyScores.length} 100`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="peak-line-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded area below the trend line */}
                  <polygon
                    points={`
                      ${weeklyScores.map((data, i) => {
                        const maxScore = Math.max(...weeklyScores.map(d => d.score), 100);
                        const h = (data.score / maxScore) * 100;
                        return `${i + 0.5},${100 - h}`;
                      }).join(' ')} 
                      ${weeklyScores.length - 0.5},100 0.5,100
                    `}
                    fill="url(#peak-line-gradient)"
                  />

                  {/* Trend line connecting the peaks */}
                  <polyline
                    points={weeklyScores.map((data, i) => {
                      const maxScore = Math.max(...weeklyScores.map(d => d.score), 100);
                      const h = (data.score / maxScore) * 100;
                      return `${i + 0.5},${100 - h}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.2)]"
                  />
                </svg>

                {/* Bars Layer */}
                <div className="grid grid-cols-7 h-full items-end gap-2 relative z-0">
                  {weeklyScores.map((data, i) => {
                    const maxScore = Math.max(...weeklyScores.map(d => d.score), 100);
                    const h = (data.score / maxScore) * 100;
                    // Highlight the current day (assuming it's the last day in our 7-day window)
                    const isToday = i === weeklyScores.length - 1;
                    
                    return (
                      <div className="h-full flex flex-col justify-end items-center" key={i}>
                        <div 
                          className={`w-full rounded-t-xl transition-all duration-1000 ${isToday ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-slate-50'}`}
                          style={{ height: `${h}%` }}
                          title={`${data.day}: ${Math.round(data.score)}%`}
                        />
                      </div>
                    );
                  })}
                </div>
             </div>
             
             <div className="flex justify-between mt-4 px-1">
                {weeklyScores.map((data, i) => {
                  const isToday = i === weeklyScores.length - 1;
                  return (
                    <span key={i} className={`text-[11px] font-black uppercase ${isToday ? 'text-red-500' : 'text-slate-400'}`}>
                      {data.day.charAt(0)}
                    </span>
                  );
                })}
             </div>
          </div>
        </div>
      </div>

      {showBackupPrompt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-4">
              {t('dashboard.backup_prompt_title')}
            </h3>
            
            <p className="text-sm text-slate-500 leading-relaxed text-center mb-8">
              {t('dashboard.backup_prompt_desc')}
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowBackupPrompt(false);
                  onLoginClick();
                }}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
              >
                {t('dashboard.backup_prompt_login')}
              </button>
              <button 
                onClick={() => setShowBackupPrompt(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
              >
                {t('dashboard.backup_prompt_cancel')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;
