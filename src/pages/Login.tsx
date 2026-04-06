import React from 'react';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import { auth } from '@/services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { storageService } from '@/services/storageService';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { useToast } from '@/contexts/ToastContext';
import { useLoading } from '@/contexts/LoadingContext';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
  onSignUpClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, onSignUpClick }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    showLoading(t('common.loading'));
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Wipe local data so we strictly use Firebase data as requested
      await storageService.clearAllPreferences();
      await audioRecordingService.clearAllRecordings();

      showToast('Login successful!', 'success');
      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format';
      }
      showToast(message, 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col items-center p-8 animate-in fade-in duration-500 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-md w-full flex flex-col items-center mt-12 mb-12 relative z-10">
        {/* Logo Section */}
        <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-100 mb-10 transform -rotate-6">
          <div className="text-white transform rotate-6">
            <Icons.Globe />
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Sparta! <span className="text-red-500">Vietnamese</span>
          </h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('auth.professional_training')}</p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.Email />
              </div>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.Lock />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700 tracking-widest"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleLogin}
          className="w-full mt-10 py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-50 hover:bg-red-600 active:scale-[0.98] transition-all"
        >
          {t('auth.login')}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        <p className="mt-12 text-sm font-bold text-slate-400">
          {t('auth.noAccount')} <button onClick={onSignUpClick} className="text-red-500 hover:underline">{t('auth.signUp')}</button>
        </p>
      </div>

      {/* Back Button */}
      <div className="mt-auto flex gap-4">
        <button 
          onClick={onBack}
          className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-lg hover:text-red-500 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default Login;
