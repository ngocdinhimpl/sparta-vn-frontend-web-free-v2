import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { cloudStorageService } from '@/services/cloudStorageService';
import { RankingRecord, storageService } from '@/services/storageService';
import { getDashboardAvatarsForSet, AVAILABLE_AVATARS } from '@/constants';
import HappyIcon from '@/assets/common/common-happy.png';
import AngryIcon from '@/assets/common/common-angry.png';

const Ranking: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'level0' | 'level8'>('level8');
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localRankingNames, setLocalRankingNames] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalData = async () => {
      const names: Record<string, string> = {};
      for (const avatar of AVAILABLE_AVATARS) {
        const levelData = await storageService.getUserLevel(avatar.id);
        if (levelData.rankingName) {
          names[avatar.id] = levelData.rankingName;
        }
      }
      setLocalRankingNames(names);
      setCurrentUserId(storageService.getUserId());
    };
    fetchLocalData();
  }, []);

  // Fetch rankings when tab changes
  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const level = activeTab === 'level0' ? 0 : 8;
        const data = await cloudStorageService.getRankingsByLevel(level);
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, [activeTab]);

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">{t('nav.ranking')}</h2>
          <p className="text-slate-500 font-medium mt-1">
            {t('ranking.subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 relative">
        {/* Animated Background Indicator */}
        <div 
          className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
          style={{ 
            left: activeTab === 'level8' ? '4px' : 'calc(50%)' 
          }}
        />
        
        <button
          onClick={() => setActiveTab('level8')}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-colors relative z-10 ${
            activeTab === 'level8' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <img src={HappyIcon} className="w-7 h-7 mb-1 drop-shadow-sm" alt="Happy" />
          <span>{t('ranking.tab_hall_of_fame')}</span>
        </button>
        <button
          onClick={() => setActiveTab('level0')}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-colors relative z-10 ${
            activeTab === 'level0' ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <img src={AngryIcon} className="w-7 h-7 mb-1 drop-shadow-sm" alt="Angry" />
          <span>{t('ranking.tab_abyss')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <p className="text-slate-500 font-medium">{t('ranking.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rankings.map((user, index) => {
              const avatarFrames = getDashboardAvatarsForSet(user.avatarId);
              // Use the appropriate frame for the level (009 for level 0, 079 for level 8)
              const displayFrameIdx = user.level === 8 ? 79 : 9;
              const avatarImg = avatarFrames[displayFrameIdx] || avatarFrames[0];
              
              return (
                <div key={`${user.userId}-${user.avatarId}`} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
                  {/* Rank Number */}
                  <div className="w-12 text-center font-black text-2xl" style={{ 
                    color: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : '#CBD5E1'
                  }}>
                    #{index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm mx-4 flex-shrink-0 relative">
                    <img 
                      src={avatarImg} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {/* Masking Logic: Only unmask if it is the current user */}
                    {user.level === 8 && !(currentUserId === user.userId || localRankingNames[user.avatarId] === user.rankingName) && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-1.5 backdrop-blur-[2px]">
                        <img src={HappyIcon} alt="Hidden" className="w-full h-full object-contain" />
                      </div>
                    )}
                    {user.level === 0 && !(currentUserId === user.userId || localRankingNames[user.avatarId] === user.rankingName) && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-1.5 backdrop-blur-[2px]">
                        <img src={AngryIcon} alt="Hidden" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 truncate">
                      {user.rankingName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {user.stage ? `Stage ${user.stage} • ` : ''}{new Date(user.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {t('ranking.score')}
                    </div>
                    <div className={`text-xl font-black ${user.level === 8 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {Math.round(user.score)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
