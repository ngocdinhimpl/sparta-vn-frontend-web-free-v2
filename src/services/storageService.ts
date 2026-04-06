/**
 * StorageService - Manages user preferences in IndexedDB
 * Stores app preferences like language selection
 */
import { cloudStorageService } from './cloudStorageService';
import { computeNewLevel, getDefaultUserLevel, UserLevelData } from './levelService';

const DB_NAME = 'SpartaPreferencesDB';
const DB_VERSION = 1;
const STORE_NAME = 'preferences';

export type Language = 'ja' | 'en';
export type VocabType = 'word' | 'phrase';

export interface VocabItem {
  id: string;
  vi: string;
  jp: string;
  en: string;
  type: VocabType;
  stage?: number;
}

export interface PronunciationResultRecord {
  vocab_id: string;
  response: any; // PronunciationResult from api
  averageOverallScore: number;
  updated_at: string;
  audioUrl?: string; // S3 URL for cloud-stored audio
}

export interface PracticeStats {
  totalSessions: number;        // Tổng số lần luyện tập
  streakDays: number;           // Số ngày luyện tập liên tục
  totalDurationSeconds: number; // Tổng thời gian luyện tập (giây)
  lastPracticeDate: string;     // Ngày luyện tập gần nhất (YYYY-MM-DD)
  updatedAt: string;            // Timestamp cập nhật cuối
}

export interface DailyScore {
  date: string;           // YYYY-MM-DD
  averageScore: number;   // Điểm trung bình trong ngày (0-100)
  totalTests: number;     // Tổng số lần test trong ngày
  updatedAt: string;      // Timestamp cập nhật cuối
}

export interface RankingRecord {
  userId: string;
  avatarId: string;
  rankingName: string;
  level: 0 | 8;
  score: number;
  timestamp: string;
}

interface Preference {
  key: string;
  value: any;
  updatedAt: string;
}

class StorageService {
  private db: IDBDatabase | null = null;
  private userId: string | null = null;

  constructor() {
    this.initDB();
  }

  /* ===================== DB ===================== */

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initDB();
  }

  /* ===================== PREFERENCES ===================== */

  async setPreference(key: string, value: any): Promise<void> {
    if (this.userId) {
      await cloudStorageService.setPreference(this.userId, key, value);
    }

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const preference: Preference = {
        key,
        value,
        updatedAt: new Date().toISOString(),
      };

      const request = store.put(preference);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    if (this.userId) {
      return cloudStorageService.getPreference<T>(this.userId, key, defaultValue);
    }

    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as Preference | undefined;
        resolve(result?.value ?? defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  }

  async deletePreference(key: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  }

  async clearAllPreferences(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  }

  /* ===================== CLOUD HELPERS ===================== */

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async syncToCloud(): Promise<void> {
    if (!this.userId) return;

    // Get all preferences except vocabulary which is common
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    const allPrefs: Preference[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    for (const pref of allPrefs) {
      if (pref.key === 'vocabulary') continue;
      
      if (pref.key.startsWith('pronunciation_')) {
        const vocab_id = pref.key.replace('pronunciation_', '');
        await cloudStorageService.savePronunciationResult(this.userId, vocab_id, pref.value);
      } else if (pref.key === 'practice_stats') {
        await cloudStorageService.savePracticeStats(this.userId, pref.value);
      } else if (pref.key.startsWith('daily_score_')) {
        const date = pref.key.replace('daily_score_', '');
        await cloudStorageService.saveDailyScore(this.userId, date, pref.value);
      } else {
        await cloudStorageService.setPreference(this.userId, pref.key, pref.value);
      }
    }
  }

  /* ===================== LANGUAGE HELPERS ===================== */

  async getLanguage(): Promise<Language> {
    return this.getPreference<Language>('language', 'ja');
  }

  async setLanguage(language: Language): Promise<void> {
    return this.setPreference('language', language);
  }

  /* ===================== RANDOM MODE HELPERS ===================== */

  async getIsRandom(): Promise<boolean> {
    return this.getPreference<boolean>('is_random', false);
  }

  async setIsRandom(isRandom: boolean): Promise<void> {
    return this.setPreference('is_random', isRandom);
  }

  /* ===================== VOCABULARY HELPERS ===================== */

  async getVocabulary(): Promise<VocabItem[] | null> {
    // Always try to get from Firebase master vocabulary collection first
    // This is public data, accessible by all users (logged in or not)
    try {
      const masterVocab = await cloudStorageService.getMasterVocabulary();
      // If master vocabulary is empty (not seeded yet), fallback to local
      if (masterVocab.length === 0) {
        console.warn('Master vocabulary not seeded yet, using local VOCAB_DATA');
        return this.getPreference<VocabItem[] | null>('vocabulary', null);
      }
      return masterVocab;
    } catch (error) {
      console.error('Error fetching master vocabulary, using local fallback:', error);
      // Fallback to local on error (offline, Firebase down, etc.)
      return this.getPreference<VocabItem[] | null>('vocabulary', null);
    }
  }

  async setVocabulary(vocabulary: VocabItem[]): Promise<void> {
    return this.setPreference('vocabulary', vocabulary);
  }

  async updateVocabItem(id: string, updates: Partial<VocabItem>): Promise<void> {
    const vocabulary = await this.getVocabulary();
    if (!vocabulary) return;

    const updatedVocabulary = vocabulary.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );

    return this.setVocabulary(updatedVocabulary);
  }

  /* ===================== PRONUNCIATION RESULTS HELPERS ===================== */

  async savePronunciationResult(vocab_id: string, response: any): Promise<void> {
    const existing = await this.getPronunciationResult(vocab_id);
    const newOverallScore = response?.score?.overall ?? 0;
    
    let averageOverallScore: number;
    
    if (existing && existing.averageOverallScore !== undefined) {
      // Calculate average: (old + new) / 2
      averageOverallScore = (existing.averageOverallScore + newOverallScore) / 2;
    } else {
      // First score
      averageOverallScore = newOverallScore;
    }

    const record: PronunciationResultRecord = {
      vocab_id,
      response,
      audioUrl: response?.audioUrl,
      averageOverallScore,
      updated_at: new Date().toISOString(),
    };

    if (this.userId) {
      await cloudStorageService.savePronunciationResult(this.userId, vocab_id, record);
    }

    // Update user level based on this score
    try {
      const avatarId = (await this.getSelectedAvatar()) || 'avatar1';
      const levelKey = `user_level_${avatarId}`;
      const existing = await this.getPreference<UserLevelData | null>(levelKey, null);
      const levelData = existing ?? getDefaultUserLevel(avatarId);
      const updated = computeNewLevel(levelData, newOverallScore);
      
      // If we just entered Level 0 or Level 8, record the score that got us there
      // We only set this if rankingName is not yet set (meaning the dialog hasn't been completed yet)
      const enteredLevel0 = updated.currentLevel === 0 && levelData.currentLevel !== 0;
      const enteredLevel8 = updated.currentLevel === 8 && levelData.currentLevel !== 8;
      
      if ((enteredLevel0 || enteredLevel8) && !updated.rankingName) {
        updated.lastScore = newOverallScore;
      }
      
      await this.setPreference(levelKey, updated);
    } catch (e) {
      console.warn('Failed to update user level:', e);
    }

    return this.setPreference(`pronunciation_${vocab_id}`, record);
  }

  async getPronunciationResult(vocab_id: string): Promise<PronunciationResultRecord | null> {
    if (this.userId) {
      return cloudStorageService.getPronunciationResult(this.userId, vocab_id);
    }

    return this.getPreference<PronunciationResultRecord | null>(
      `pronunciation_${vocab_id}`,
      null
    );
  }

  async isVocabCompleted(vocab_id: string): Promise<boolean> {
    const result = await this.getPronunciationResult(vocab_id);
    return result !== null;
  }

  /* ===================== PRACTICE STATISTICS HELPERS ===================== */

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async getPracticeStats(): Promise<PracticeStats> {
    const defaultStats: PracticeStats = {
      totalSessions: 0,
      streakDays: 0,
      totalDurationSeconds: 0,
      lastPracticeDate: '',
      updatedAt: new Date().toISOString(),
    };

    if (this.userId) {
      const cloudStats = await cloudStorageService.getPracticeStats(this.userId);
      if (cloudStats) return cloudStats;
    }

    return this.getPreference<PracticeStats>('practice_stats', defaultStats);
  }

  async incrementPracticeSession(audioDurationSeconds: number): Promise<void> {
    const stats = await this.getPracticeStats();
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    // Increment total sessions
    stats.totalSessions += 1;

    // Add audio duration to total
    // Safety check: if existing total is Infinity or NaN (from previous errors), reset it
    if (!Number.isFinite(stats.totalDurationSeconds)) {
      stats.totalDurationSeconds = 0;
    }
    stats.totalDurationSeconds += audioDurationSeconds;

    // Update streak days
    if (stats.lastPracticeDate === yesterday) {
      // Practiced yesterday - continue streak
      stats.streakDays += 1;
    } else if (stats.lastPracticeDate === today) {
      // Already practiced today - don't change streak
      // Just update session count and duration
    } else {
      // No practice yesterday or today is first practice - reset streak
      stats.streakDays = 1;
    }

    // Update last practice date
    stats.lastPracticeDate = today;
    stats.updatedAt = new Date().toISOString();

    if (this.userId) {
      await cloudStorageService.savePracticeStats(this.userId, stats);
    }

    await this.setPreference('practice_stats', stats);
  }

  async resetPracticeStats(): Promise<void> {
    const defaultStats: PracticeStats = {
      totalSessions: 0,
      streakDays: 0,
      totalDurationSeconds: 0,
      lastPracticeDate: '',
      updatedAt: new Date().toISOString(),
    };
    await this.setPreference('practice_stats', defaultStats);
  }

  /* ===================== DAILY SCORE HELPERS ===================== */

  /**
   * Update daily average score
   * If existing score != 0: average = (existing + new) / 2
   * If existing score = 0: average = new score
   */
  async updateDailyScore(newScore: number): Promise<void> {
    const today = this.getTodayDateString();
    const key = `daily_score_${today}`;
    
    const existingScore = await this.getPreference<DailyScore | null>(key, null);
    
    let averageScore: number;
    let totalTests: number;
    
    if (existingScore && existingScore.averageScore !== 0) {
      // Calculate average: (old + new) / 2
      averageScore = (existingScore.averageScore + newScore) / 2;
      totalTests = existingScore.totalTests + 1;
    } else {
      // First score or existing was 0
      averageScore = newScore;
      totalTests = 1;
    }
    
    const dailyScore: DailyScore = {
      date: today,
      averageScore,
      totalTests,
      updatedAt: new Date().toISOString(),
    };
    
    if (this.userId) {
      await cloudStorageService.saveDailyScore(this.userId, today, dailyScore);
    }

    await this.setPreference(key, dailyScore);
  }

  async getDailyScore(date?: string): Promise<DailyScore | null> {
    const targetDate = date || this.getTodayDateString();
    
    if (this.userId) {
      return cloudStorageService.getDailyScore(this.userId, targetDate);
    }

    const key = `daily_score_${targetDate}`;
    return this.getPreference<DailyScore | null>(key, null);
  }

  async getTodayScore(): Promise<DailyScore | null> {
    return this.getDailyScore();
  }

  /* ===================== AVATAR SELECTION ===================== */

  async getSelectedAvatar(): Promise<string | null> {
    return this.getPreference<string | null>('selected_avatar', null);
  }

  async setSelectedAvatar(avatarId: string): Promise<void> {
    await this.setPreference('selected_avatar', avatarId);
  }

  async hasCompletedAvatarSelection(): Promise<boolean> {
    const selected = await this.getSelectedAvatar();
    return selected !== null;
  }

  /* ===================== WEAK WORDS ANALYSIS ===================== */

  async getWeakWords(): Promise<Array<{
    word: string;
    accuracy: number;
    level: 1 | 2 | 3; // 1: <75, 2: <65, 3: <50
  }>> {
    let pronunciationResults: PronunciationResultRecord[] = [];

    // Get pronunciation results from appropriate storage
    if (this.userId) {
      // Logged in → Get from Firebase
      pronunciationResults = await cloudStorageService.getAllPronunciationResults(this.userId);
    } else {
      // Guest → Get from IndexedDB
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      
      const allPreferences: Preference[] = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      // Filter pronunciation results (keys starting with 'pronunciation_')
      pronunciationResults = allPreferences
        .filter(pref => pref.key.startsWith('pronunciation_'))
        .map(pref => pref.value as PronunciationResultRecord);
    }

    // Map to store best accuracy for each word
    const wordAccuracyMap = new Map<string, number>();

    // Process all pronunciation results and extract word-level scores
    for (const result of pronunciationResults) {
      const response = result?.response;
      
      if (!response?.words || !Array.isArray(response.words)) continue;

      // Get word-level pronunciation assessment
      const words = response.words;
      
      for (const wordData of words) {
        if (!wordData.Word || !wordData.PronunciationAssessment) continue;
        
        const word = wordData.Word.toLowerCase();
        const accuracy = wordData.PronunciationAssessment.AccuracyScore || 0;
        
        // Only consider words with accuracy < 75
        if (accuracy >= 75) continue;

        // Keep the best (highest) accuracy score for each unique word
        const currentBest = wordAccuracyMap.get(word);
        if (!currentBest || accuracy > currentBest) {
          wordAccuracyMap.set(word, accuracy);
        }
      }
    }

    // Convert to array and categorize by level
    const weakWords = Array.from(wordAccuracyMap.entries()).map(([word, accuracy]) => {
      let level: 1 | 2 | 3;
      if (accuracy < 50) {
        level = 3;
      } else if (accuracy < 65) {
        level = 2;
      } else {
        level = 1;
      }

      return { word, accuracy, level };
    });

    // Sort by accuracy (lowest first - most problematic)
    weakWords.sort((a, b) => a.accuracy - b.accuracy);

    return weakWords;
  }

  /* ===================== USER LEVEL ===================== */

  async getUserLevel(avatarId: string): Promise<UserLevelData> {
    const key = `user_level_${avatarId}`;
    const stored = await this.getPreference<UserLevelData | null>(key, null);
    return stored ?? getDefaultUserLevel(avatarId);
  }

  async setUserLevel(data: UserLevelData): Promise<void> {
    const key = `user_level_${data.avatarId}`;
    await this.setPreference(key, data);
  }

  async updateUserLevel(avatarId: string, updates: Partial<UserLevelData>): Promise<void> {
    const current = await this.getUserLevel(avatarId);
    const updated = { ...current, ...updates };
    await this.setUserLevel(updated);
  }
}

export const storageService = new StorageService();
export default StorageService;
