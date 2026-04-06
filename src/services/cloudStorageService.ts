import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { VocabItem, PronunciationResultRecord, PracticeStats, DailyScore, RankingRecord } from './storageService';

class CloudStorageService {
  private getCollectionPath(userId: string, subCollection: string) {
    return `users/${userId}/${subCollection}`;
  }

  /* ===================== RANKINGS (Shared) ===================== */

  async saveRanking(record: RankingRecord): Promise<void> {
    // Generate a unique ID combining userId and avatarId
    const docId = `${record.userId}_${record.avatarId}`;
    const docRef = doc(db, 'rankings', docId);
    await setDoc(docRef, record);
  }

  async getRankingsByLevel(level: 0 | 8): Promise<RankingRecord[]> {
    try {
      const colRef = collection(db, 'rankings');
      // Query for specific level, order by score (ascending for level 0, descending for level 8)
      // Note: Firestore requires composite indexes for multiple fields in orderBy,
      // so we might need to sort on client side or create the index.
      // For now, we query by level and sort on client.
      const q = query(colRef, where('level', '==', level));
      const querySnapshot = await getDocs(q);
      
      const rankings = querySnapshot.docs.map(doc => doc.data() as RankingRecord);
      
      // Sort by most recent first
      rankings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return rankings;
    } catch (error) {
      console.error(`Error fetching rankings for level ${level}:`, error);
      return [];
    }
  }

  /* ===================== PREFERENCES ===================== */

  async setPreference(userId: string, key: string, value: any): Promise<void> {
    const docRef = doc(db, this.getCollectionPath(userId, 'preferences'), key);
    await setDoc(docRef, {
      value,
      updatedAt: new Date().toISOString()
    });
  }

  async getPreference<T>(userId: string, key: string, defaultValue: T): Promise<T> {
    const docRef = doc(db, this.getCollectionPath(userId, 'preferences'), key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().value as T;
    }
    return defaultValue;
  }

  /* ===================== PRONUNCIATION RESULTS ===================== */

  async savePronunciationResult(userId: string, vocab_id: string, record: PronunciationResultRecord): Promise<void> {
    const docRef = doc(db, this.getCollectionPath(userId, 'pronunciation_results'), vocab_id);
    await setDoc(docRef, record);
  }

  async getPronunciationResult(userId: string, vocab_id: string): Promise<PronunciationResultRecord | null> {
    const docRef = doc(db, this.getCollectionPath(userId, 'pronunciation_results'), vocab_id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as PronunciationResultRecord) : null;
  }

  async getAllPronunciationResults(userId: string): Promise<PronunciationResultRecord[]> {
    const colRef = collection(db, this.getCollectionPath(userId, 'pronunciation_results'));
    const querySnapshot = await getDocs(colRef);
    return querySnapshot.docs.map(doc => doc.data() as PronunciationResultRecord);
  }

  async updateAudioUrl(userId: string, vocab_id: string, audioUrl: string): Promise<void> {
    const docRef = doc(db, this.getCollectionPath(userId, 'pronunciation_results'), vocab_id);
    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(docRef, { audioUrl }, { merge: true });
  }

  /* ===================== PRACTICE STATISTICS ===================== */

  async savePracticeStats(userId: string, stats: PracticeStats): Promise<void> {
    const docRef = doc(db, this.getCollectionPath(userId, 'stats'), 'practice_stats');
    await setDoc(docRef, stats);
  }

  async getPracticeStats(userId: string): Promise<PracticeStats | null> {
    const docRef = doc(db, this.getCollectionPath(userId, 'stats'), 'practice_stats');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as PracticeStats) : null;
  }

  /* ===================== DAILY SCORES ===================== */

  async saveDailyScore(userId: string, date: string, dailyScore: DailyScore): Promise<void> {
    const docRef = doc(db, this.getCollectionPath(userId, 'daily_scores'), date);
    await setDoc(docRef, dailyScore);
  }

  async getDailyScore(userId: string, date: string): Promise<DailyScore | null> {
    const docRef = doc(db, this.getCollectionPath(userId, 'daily_scores'), date);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as DailyScore) : null;
  }

  async getAllDailyScores(userId: string): Promise<DailyScore[]> {
    const colRef = collection(db, this.getCollectionPath(userId, 'daily_scores'));
    const querySnapshot = await getDocs(colRef);
    return querySnapshot.docs.map(doc => doc.data() as DailyScore);
  }

  /* ===================== MASTER VOCABULARY (Shared) ===================== */

  /**
   * Get all vocabulary items from master collection
   * This is a shared collection readable by all authenticated users
   */
  async getMasterVocabulary(): Promise<VocabItem[]> {
    try {
      const colRef = collection(db, 'vocabulary');
      const querySnapshot = await getDocs(colRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VocabItem));
    } catch (error) {
      console.error('Error fetching master vocabulary:', error);
      return [];
    }
  }

  /**
   * Get a single vocabulary item from master collection
   */
  async getMasterVocabularyItem(vocab_id: string): Promise<VocabItem | null> {
    try {
      const docRef = doc(db, 'vocabulary', vocab_id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as VocabItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching vocabulary item:', error);
      return null;
    }
  }
}

export const cloudStorageService = new CloudStorageService();
export default cloudStorageService;
