import React, { useEffect, useState } from 'react';
import { Icons } from '@/constants';
import { useTranslation } from '@/i18n';
import { auth } from '@/services/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { useToast } from '@/contexts/ToastContext';
import { useLoading } from '@/contexts/LoadingContext';
import logo from '@/assets/logo/logo.png';

interface ResetPasswordProps {
  oobCode: string;
  onSuccess: () => void;
  onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ oobCode, onSuccess, onBack }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verify the reset code when component mounts
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setCodeError(t('auth.invalidResetLink'));
        setIsValidating(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setAccountEmail(email);
      } catch (error: any) {
        console.error('Verify code error:', error);
        setCodeError(t('auth.invalidResetLink'));
      } finally {
        setIsValidating(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(t('auth.passwordMismatch'), 'error');
      return;
    }

    showLoading(t('common.loading'));
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      showToast(t('auth.resetPasswordSuccess'), 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Confirm password reset error:', error);
      showToast(error.message || 'Failed to update password', 'error');
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

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {t('auth.resetPassword')}
          </h1>
          {accountEmail && (
            <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full inline-block mt-1">
              {accountEmail}
            </p>
          )}
        </div>

        {isValidating ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">{t('common.loading')}</p>
          </div>
        ) : codeError ? (
          <div className="w-full bg-white border border-red-100 rounded-2xl p-6 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">{codeError}</p>
            <button
              onClick={onBack}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all"
            >
              {t('auth.signIn')}
            </button>
          </div>
        ) : (
          <>
            {/* Form Section */}
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {t('auth.newPassword')}
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                    <Icons.Lock />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700 tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {t('auth.confirmNewPassword')}
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                    <Icons.Lock />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-700 tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleResetPassword}
              className="w-full mt-10 py-5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-50 hover:bg-red-600 active:scale-[0.98] transition-all"
            >
              {t('auth.updatePassword')}
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            <p className="mt-12 text-sm font-bold text-slate-400">
              {t('auth.haveAccount')}{' '}
              <button onClick={onBack} className="text-red-500 hover:underline">
                {t('auth.login')}
              </button>
            </p>
          </>
        )}
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

export default ResetPassword;
