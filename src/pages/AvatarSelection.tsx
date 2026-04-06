import React, { useState, useEffect } from 'react';
import { AVAILABLE_AVATARS, getDashboardAvatarsForSet } from '@/constants';
import { useTranslation } from '@/i18n';

interface AvatarSelectionProps {
  isFirstTime: boolean;
  onSelectAvatar: (avatarId: string) => void;
  onBack?: () => void;
  currentAvatarId?: string;
  disabledAvatars?: string[];
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  isFirstTime,
  onSelectAvatar,
  onBack,
  currentAvatarId,
  disabledAvatars = [],
}) => {
  const { t } = useTranslation();
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(
    currentAvatarId || null
  );
  const [previewFrame, setPreviewFrame] = useState(0);
  const [previewFrames, setPreviewFrames] = useState<string[]>([]);

  // Update preview frames when selection changes
  useEffect(() => {
    if (selectedAvatarId) {
      const frames = getDashboardAvatarsForSet(selectedAvatarId);
      const tier2Frames = frames.slice(20, 30);
      setPreviewFrames(tier2Frames);
      setPreviewFrame(0);
    } else {
      setPreviewFrames([]);
    }
  }, [selectedAvatarId]);

  // Animate preview
  useEffect(() => {
    if (previewFrames.length === 0) return;
    const interval = setInterval(() => {
      setPreviewFrame((prev) => (prev + 1) % previewFrames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [previewFrames]);

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  const handleConfirm = () => {
    if (selectedAvatarId) {
      onSelectAvatar(selectedAvatarId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {!isFirstTime && onBack && (
            <button
              onClick={onBack}
              className="absolute top-8 left-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            {isFirstTime ? t('avatar_selection.title_first') : t('avatar_selection.title_change')}
          </h1>
          <p className="text-slate-500 font-medium">
            {isFirstTime
              ? t('avatar_selection.subtitle_first')
              : t('avatar_selection.subtitle_change')}
          </p>
        </div>

        {/* Avatar Horizontal Scroll Row */}
        <div className="overflow-x-auto pb-3 mb-6 -mx-2 px-2">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {AVAILABLE_AVATARS.map((avatar) => {
              const isDisabled = disabledAvatars.includes(avatar.id);
              const isSelected = selectedAvatarId === avatar.id && !isDisabled;
              return (
                <button
                  key={avatar.id}
                  onClick={() => !isDisabled && handleSelectAvatar(avatar.id)}
                  disabled={isDisabled}
                  className={`relative bg-white rounded-2xl p-3 border-2 transition-all duration-200 flex-shrink-0 w-28
                    ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}
                    ${isSelected
                      ? 'border-red-500 shadow-lg shadow-red-100'
                      : 'border-slate-100 shadow-md hover:border-red-200'
                    }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {/* Disabled Indicator */}
                  {isDisabled && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  )}
                  {/* Avatar Thumbnail */}
                  <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={getDashboardAvatarsForSet(avatar.id)[25]}
                      alt={avatar.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Description only */}
                  <p className="text-xs font-bold text-slate-700 text-center leading-tight">
                    {avatar.description}
                  </p>
                  {isDisabled && (
                    <p className="text-[10px] font-bold text-rose-500 text-center mt-1">
                      {t('avatar_selection.completed')}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Preview */}
        {selectedAvatarId && previewFrames.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
              {t('avatar_selection.preview')}
            </h3>
            <div className="aspect-square max-w-48 mx-auto bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src={previewFrames[previewFrame]}
                alt="Avatar Preview"
                className="w-full h-full object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedAvatarId}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 ${
            selectedAvatarId
              ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-xl shadow-red-100'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isFirstTime ? t('avatar_selection.start_learning') : t('avatar_selection.confirm')}
        </button>
      </div>
    </div>
  );
};

export default AvatarSelection;
