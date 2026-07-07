import React, { useState } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/i18n';

const Feedback: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        content: content,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });
      showToast(t('feedback.success'), 'success');
      setContent('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast(t('feedback.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">{t('feedback.title')}</h2>
        <p className="text-slate-500 mt-2 font-medium">
          {t('feedback.subtitle')}
        </p>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t('feedback.label')}</label>
            <textarea
              className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-red-500 focus:ring-0 outline-none transition-all resize-none h-48 bg-slate-50 font-medium"
              placeholder={t('feedback.placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
