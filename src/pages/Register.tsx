import React, { useState } from 'react';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import { auth } from '@/services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/contexts/ToastContext';
import { useLoading } from '@/contexts/LoadingContext';
import { storageService } from '@/services/storageService';
import { audioRecordingService } from '@/services/AudioRecordingService';

interface RegisterProps {
  onRegister: () => void;
  onSignInClick: () => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSignInClick, onBack }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    showLoading(t('common.loading'));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: fullName });

      showToast('Account created successfully!', 'success');

      // Ask for sync
      const shouldSync = window.confirm('Would you like to sync your local data to the cloud?');
      if (shouldSync) {
        showLoading('Syncing data...');
        storageService.setUserId(user.uid);
        
        // Sync text data
        await storageService.syncToCloud();
        
        // Recordings are not synced to cloud here out-of-the-box in this version
        showToast('Data synced successfully!', 'success');
      }

      // Wipe local data so we strictly use Firebase data as requested
      await storageService.clearAllPreferences();
      await audioRecordingService.clearAllRecordings();

      onRegister();
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
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

      <div className="max-w-md w-full flex flex-col items-center mt-10 mb-12 relative z-10">
        {/* Logo Section */}
        <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-100 mb-8 transform -rotate-3 transition-transform hover:rotate-0">
          <div className="text-white font-black text-4xl">S!</div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-1">
            Sparta! Vietnamese
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{t('auth.professional_pronunciation')}</p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.fullName')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.User />
              </div>
              <input 
                type="text" 
                placeholder={t('auth.enter_name')} 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                 <span className="text-lg font-bold">@</span>
              </div>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.Lock />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-5 pl-14 pr-14 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700 tracking-widest"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 transition-colors"
              >
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.confirmPassword')}</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.Lock />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700 tracking-widest"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleRegister}
          className="w-full mt-10 py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-50 hover:bg-red-600 active:scale-[0.98] transition-all group"
        >
          {t('auth.register')}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        <p className="mt-10 text-xs font-bold text-slate-400">
          {t('auth.haveAccount')} <button onClick={onSignInClick} className="text-red-500 hover:underline">{t('auth.signIn')}</button>
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

export default Register;
