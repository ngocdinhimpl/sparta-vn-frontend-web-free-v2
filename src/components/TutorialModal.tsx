import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/i18n';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t('tutorial.slide1_title'),
      description: t('tutorial.slide1_desc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      )
    },
    {
      title: t('tutorial.slide2_title'),
      description: t('tutorial.slide2_desc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    {
      title: t('tutorial.slide3_title'),
      description: t('tutorial.slide3_desc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      localStorage.setItem('has_seen_tutorial', 'true');
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleNext}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          {slides[currentSlide].icon}
        </div>
        
        <h3 className="text-2xl font-extrabold text-slate-800 mb-4">
          {slides[currentSlide].title}
        </h3>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-8 min-h-[80px]">
          {slides[currentSlide].description}
        </p>

        {/* Indicators */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-red-500' : 'w-2 bg-slate-200'}`}
            ></div>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full py-4 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
        >
          {currentSlide === slides.length - 1 ? t('common.start') : t('tutorial.next')}
          {currentSlide === slides.length - 1 ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          )}
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TutorialModal;
