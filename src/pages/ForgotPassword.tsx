import React, { useState } from 'react';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import { auth } from '@/services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/contexts/ToastContext';
import { useLoading } from '@/contexts/LoadingContext';
import logo from '@/assets/logo/logo.png';

interface ForgotPasswordProps {
  onBack: () => void;
  onSignInClick: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSignInClick }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const [email, setEmail] = useState('');

  const handleSendResetLink = async () => {
    if (!email) {
      showToast(t('auth.email') + ' is required', 'warning');
      return;
    }

    showLoading(t('common.loading'));
    try {
      auth.languageCode = language;
      await sendPasswordResetEmail(auth, email);
      showToast(t('auth.resetLinkSent'), 'success');
      onSignInClick();
    } catch (error: any) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
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
        <img
          src={logo}
          alt="Sparta Logo"
          className="w-24 h-24 object-contain mb-10 shadow-2xl shadow-red-100 rounded-[2rem] transform -rotate-6"
        />

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {t('auth.resetPassword')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
            {t('auth.resetPasswordDesc')}
          </p>
          <p className="text-xs font-semibold text-red-400 max-w-xs leading-relaxed mt-2">
            * {t('auth.checkSpamFolder')}
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {t('auth.email')}
            </label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Icons.Email />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendResetLink()}
                className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSendResetLink}
          className="w-full mt-10 py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-50 hover:bg-red-600 active:scale-[0.98] transition-all"
        >
          {t('auth.sendResetLink')}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>

        <p className="mt-12 text-sm font-bold text-slate-400">
          {t('auth.haveAccount')}{' '}
          <button onClick={onSignInClick} className="text-red-500 hover:underline">
            {t('auth.login')}
          </button>
        </p>
      </div>

      {/* Back Button */}
      <div className="mt-auto flex gap-4">
        <button
          onClick={onBack}
          className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-lg hover:text-red-500 transition-all"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
