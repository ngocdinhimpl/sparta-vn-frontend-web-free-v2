/**
 * Level Service - Pure level logic for 9-level scoring system
 *
 * Levels 0–8:
 *  0 = level 1 with 3 consecutive scores < 10
 *  1 = score threshold 10
 *  2 = score threshold 20
 *  3 = score threshold 30  ← default on first launch
 *  4 = score threshold 40
 *  5 = score threshold 50
 *  6 = score threshold 60
 *  7 = score threshold 95
 *  8 = level 7 with 3 consecutive scores > 95
 */

export interface UserLevelData {
  currentLevel: number;          // 0–8
  previousLevel: number | null;  // null on very first session
  consecutiveCount: number;      // how many consecutive scores in same direction
  streakDirection: 'up' | 'down' | null;
  avatarId: string;              // e.g. 'avatar1'
  rankingName?: string;          // Name shown on ranking board when reaching level 0 or 8
  lastScore?: number;            // The score that triggered the level 0 or 8 entry
}

/**
 * Threshold for each level.
 * "up" threshold: score must be ABOVE this to count as an "up" streak for this level.
 * "down" threshold: score must be BELOW this to count as a "down" streak for this level.
 *
 * Level 0: only goes up (no lower), up when score >= 10
 * Level 8: only goes down (no higher), down when score < 95
 */
export const LEVEL_UP_THRESHOLDS: number[] = [10, 10, 20, 30, 40, 50, 60, 95, Infinity];
export const LEVEL_DOWN_THRESHOLDS: number[] = [-Infinity, 10, 20, 30, 40, 50, 60, 95, 95];

/**
 * Avatar frame index for each level (the "resting" end-frame).
 * Each level occupies a 10-frame block: level N → frames N*10 to N*10+9.
 * The canonical display frame is the LAST frame of the block (index N*10+9).
 *
 * Level 0 → avatar_009  (frames 000–009)
 * Level 1 → avatar_019  (but displayed as avatar_009 per spec)
 * ...
 * The spec maps:
 *   level 0 → avatar_000
 *   level 1 → avatar_009
 *   level 2 → avatar_019
 *   level 3 → avatar_029
 *   ...
 *   level 8 → avatar_079
 */
export const LEVEL_DISPLAY_FRAMES: number[] = [0, 9, 19, 29, 39, 49, 59, 69, 79];

/** Returns the default level data for a brand-new user. */
export function getDefaultUserLevel(avatarId: string): UserLevelData {
  return {
    currentLevel: 3,
    previousLevel: null,
    consecutiveCount: 0,
    streakDirection: null,
    avatarId,
  };
}

/**
 * Given the current level state and a new score, compute the updated level.
 * Streak of 3 in the same direction triggers a level change.
 */
export function computeNewLevel(
  current: UserLevelData,
  score: number
): UserLevelData {
  const { currentLevel } = current;

  const upThreshold = LEVEL_UP_THRESHOLDS[currentLevel];
  const downThreshold = LEVEL_DOWN_THRESHOLDS[currentLevel];

  const qualifiesUp   = score >= upThreshold   && currentLevel < 8;
  const qualifiesDown = score < downThreshold  && currentLevel > 0;

  // Determine if the new score continues the current streak
  let newDirection = current.streakDirection;
  let newCount = current.consecutiveCount;

  if (qualifiesUp) {
    if (current.streakDirection === 'up') {
      newCount += 1;
    } else {
      newDirection = 'up';
      newCount = 1;
    }
  } else if (qualifiesDown) {
    if (current.streakDirection === 'down') {
      newCount += 1;
    } else {
      newDirection = 'down';
      newCount = 1;
    }
  } else {
    // Score is in the neutral range — reset streak
    newDirection = null;
    newCount = 0;
  }

  // Check if streak threshold (3) is reached
  if (newCount >= 3) {
    const newLevel = newDirection === 'up'
      ? Math.min(currentLevel + 1, 8)
      : Math.max(currentLevel - 1, 0);

    return {
      currentLevel: newLevel,
      previousLevel: currentLevel,
      consecutiveCount: 0,
      streakDirection: null,
      avatarId: current.avatarId,
    };
  }

  return {
    ...current,
    consecutiveCount: newCount,
    streakDirection: newDirection,
  };
}

/**
 * Get the 10-frame block indices for a given level.
 * E.g. level 3 → indices 30–39 (avatar_030 to avatar_039).
 */
export function getLevelFrameRange(level: number): { start: number; end: number } {
  return { start: level * 10, end: level * 10 + 9 };
}
