import React, { useState } from 'react';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import { Language, storageService } from '@/services/storageService';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useToast } from '@/contexts/ToastContext';
import MigrationPanel from '@/components/admin/MigrationPanel';

interface SettingsProps {
  onLoginClick: () => void;
  currentUser: User | null;
  onChangeAvatar?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLoginClick, currentUser, onChangeAvatar }) => {
  const { t, language, setLanguage } = useTranslation();
  const { showToast } = useToast();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Wipe local data so guest session starts fresh
      await storageService.clearAllPreferences();
      await audioRecordingService.clearAllRecordings();

      showToast(t('settings.logout_success'), 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed', 'error');
    }
  };

  const languageDisplay = language === 'ja' ? t('settings.japanese') : t('settings.english');

  return (
    <>
      <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* User Profile Section (If Logged In) */}
        {currentUser && (
          <div className="mb-10 px-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Profile
            </h3>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-100">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900">{currentUser.displayName || 'User'}</h4>
                <p className="text-slate-500 font-medium">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Settings */}
        {onChangeAvatar && (
          <div className="mb-6 px-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Avatar
            </h3>
            <button
              onClick={onChangeAvatar}
              className="w-full bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-100 shadow-sm hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎭</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800">{t('settings.change_avatar')}</div>
                  <div className="text-xs text-slate-500">{t('settings.customize_appearance')}</div>
                </div>
              </div>
              <div className="text-slate-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        )}

        <div className="mb-6 px-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            {t('settings.application')}
          </h3>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            {/* App Language Row */}
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
              <div className="flex items-center gap-4 text-slate-700 font-bold">
                <div className="text-slate-400">
                  <Icons.Globe />
                </div>
                <span>{t('settings.language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-sm">{languageDisplay}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Migration Panel (Admin Only - Show for logged in users) */}
        {/* {currentUser && (
          <div className="mb-6 px-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Admin Tools
            </h3>
            <MigrationPanel />
          </div>
        )} */}

        {/* Action Button Section */}
        <div className="mt-auto px-4 pb-12">
          {currentUser ? (
             <button 
              onClick={handleLogout}
              className="w-full bg-[#1A1F2B] text-white py-5 rounded-xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
            >
              <Icons.Logout />
              Logout
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="w-full bg-[#1A1F2B] text-white py-5 rounded-xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
            >
              <Icons.Login />
              {t('settings.loginRegister')}
            </button>
          )}
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setShowLanguageModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-slate-800 mb-4">{t('settings.selectLanguage')}</h3>
            
            <div className="space-y-2">
              {/* Japanese Option */}
              <button
                onClick={() => handleLanguageSelect('ja')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  language === 'ja' 
                    ? 'bg-red-50 border-2 border-red-500' 
                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇯🇵</span>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">{t('settings.japanese')}</div>
                    <div className="text-xs text-slate-500">日本語</div>
                  </div>
                </div>
                {language === 'ja' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>

              {/* English Option */}
              <button
                onClick={() => handleLanguageSelect('en')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  language === 'en' 
                    ? 'bg-red-50 border-2 border-red-500' 
                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">{t('settings.english')}</div>
                    <div className="text-xs text-slate-500">English</div>
                  </div>
                </div>
                {language === 'en' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
