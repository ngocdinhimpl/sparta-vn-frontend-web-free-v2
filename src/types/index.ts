export interface SoundAnalysis {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  icon: string;
  color: string;
}

export interface Stat {
  label: string;
  value: string;
  unit?: string;
  icon?: string;
  colorClass: string;
}

export enum AppTab {
  HOME = 'home',
  TRAINING = 'training',
  HISTORY = 'history',
  WEAK_SOUNDS = 'weak_sounds',
  RANKING = 'ranking',
  SETTINGS = 'settings',
  AVATAR_SELECTION = 'avatar_selection',
  FEEDBACK = 'feedback',
}

export interface VocabItem {
  id: string;
  vi: string;
  jp: string;
  completed: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: string;
  time: string;
  score: string;
  stars: number;
  iconType: string;
}

export type WordTimeline = {
  word: string;
  startMs: number;
  endMs: number;
  accuracy: number;
};
