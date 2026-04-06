import { useState, useEffect, useRef } from 'react';
import { storageService } from '@/services/storageService';
import { UserLevelData, getLevelFrameRange } from '@/services/levelService';
import { getDashboardAvatarsForSet } from '@/constants';

export interface DashboardAvatarState {
  currentAvatarImage: string;
  currentLevel: number;
  previousLevel: number | null;
  isAnimating: boolean;
}

/**
 * useDashboardAvatar
 *
 * Animation rules:
 *  • No previousLevel (first launch at default level 3):
 *      Animate frames [level*10 + 0 ... level*10 + 9] → play the block forward, then loop last frame.
 *
 *  • Level UP (prev < current):
 *      Animate the NEW level's block forward: [current*10 ... current*10+9]
 *      Then loop the last frame.
 *
 *  • Level DOWN (prev > current):
 *      Animate the OLD level's block in REVERSE: [prev*10+9 ... prev*10+0]
 *      i.e. land on the first frame of that block once done, then loop last frame of current.
 *
 *  • Same level (no change):
 *      Just loop the last frame: avatar_[level*10+9]
 */
export const useDashboardAvatar = (): DashboardAvatarState => {
  const [levelData, setLevelData] = useState<UserLevelData | null>(null);
  const [animFrames, setAnimFrames] = useState<string[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [loopFrame, setLoopFrame] = useState<string>('');
  const [isTransition, setIsTransition] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load level data on mount
  useEffect(() => {
    const load = async () => {
      const avatarId = (await storageService.getSelectedAvatar()) || 'avatar1';
      const data = await storageService.getUserLevel(avatarId);
      setLevelData(data);
    };
    load();
  }, []);

  // When level data is ready, set up animation frames
  useEffect(() => {
    if (!levelData) return;

    const avatarId = levelData.avatarId || 'avatar1';
    const allFrames = getDashboardAvatarsForSet(avatarId);
    const { currentLevel, previousLevel } = levelData;

    // The static "idle" frame for the current level (last frame of block)
    const { end } = getLevelFrameRange(currentLevel);
    const idleFrame = allFrames[end] || allFrames[0];
    setLoopFrame(idleFrame);

    if (previousLevel === null) {
      // First launch — animate the full block of current level forward
      const { start, end: e } = getLevelFrameRange(currentLevel);
      const frames = allFrames.slice(start, e + 1);
      setAnimFrames(frames);
      setIsTransition(true);
    } else if (currentLevel > previousLevel) {
      // Level UP: animate new level's block forward
      const { start, end: e } = getLevelFrameRange(currentLevel);
      const frames = allFrames.slice(start, e + 1);
      setAnimFrames(frames);
      setIsTransition(true);
    } else if (currentLevel < previousLevel) {
      // Level DOWN: animate old level's block in REVERSE
      const { start, end: e } = getLevelFrameRange(previousLevel);
      const frames = allFrames.slice(start, e + 1).reverse();
      setAnimFrames(frames);
      setIsTransition(true);
    } else {
      // Same level — skip transition, stay on idle frame
      setAnimFrames([]);
      setIsTransition(false);
    }

    setFrameIdx(0);
  }, [levelData]);

  // Animation loop
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animFrames.length === 0) return;

    intervalRef.current = setInterval(() => {
      setFrameIdx(prev => {
        const next = prev + 1;
        if (next >= animFrames.length) {
          // Transition finished — clear and move to idle
          clearInterval(intervalRef.current!);
          setIsTransition(false);
          setAnimFrames([]);
          return prev;
        }
        return next;
      });
    }, 100); // 100ms per frame during transition

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [animFrames]);

  // Compute current displayed image
  const currentAvatarImage: string =
    animFrames.length > 0 && frameIdx < animFrames.length
      ? animFrames[frameIdx]
      : loopFrame;

  return {
    currentAvatarImage,
    currentLevel: levelData?.currentLevel ?? 3,
    previousLevel: levelData?.previousLevel ?? null,
    isAnimating: isTransition,
  };
};
