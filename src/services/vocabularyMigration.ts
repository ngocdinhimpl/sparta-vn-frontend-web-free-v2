/**
 * Migration Script: Seed Master Vocabulary to Firebase
 * 
 * This script migrates vocabulary data from local constants to a shared
 * Firestore collection that all users can read from.
 * 
 * Usage:
 *   - Run once from browser console after logging in as admin
 *   - Or call from Settings page with admin permissions
 */

import { db } from './firebase';
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { VOCAB_DATA } from '@/constants';
import { VocabItem } from './storageService';

const MASTER_VOCAB_COLLECTION = 'vocabulary';

export class VocabularyMigration {
  /**
   * Seed all vocabulary items to the master collection
   * Uses batch writes for efficiency (max 500 writes per batch)
   */
  static async seedMasterVocabulary(): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> {
    try {
      console.log('🚀 Starting vocabulary migration...');
      
      const batch = writeBatch(db);
      let count = 0;

      // Add each vocabulary item to the batch
      VOCAB_DATA.forEach((vocab: VocabItem) => {
        const docRef = doc(db, MASTER_VOCAB_COLLECTION, vocab.id);
        batch.set(docRef, {
          ...vocab,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        count++;
      });

      // Commit the batch
      await batch.commit();

      console.log(`✅ Successfully seeded ${count} vocabulary items!`);
      
      return {
        success: true,
        message: `Successfully seeded ${count} vocabulary items to master collection`,
        count,
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
        count: 0,
      };
    }
  }

  /**
   * Get count of items in master vocabulary collection
   */
  static async getMasterVocabularyCount(): Promise<number> {
    try {
      const snapshot = await getDocs(collection(db, MASTER_VOCAB_COLLECTION));
      return snapshot.size;
    } catch (error) {
      console.error('Error counting vocabulary:', error);
      return 0;
    }
  }

  /**
   * Check if master vocabulary has been seeded
   */
  static async isMasterVocabularySeeded(): Promise<boolean> {
    const count = await this.getMasterVocabularyCount();
    return count > 0;
  }

  /**
   * Update a single vocabulary item in master collection
   * (Admin only operation)
   */
  static async updateMasterVocabularyItem(
    vocab_id: string,
    updates: Partial<VocabItem>
  ): Promise<void> {
    const docRef = doc(db, MASTER_VOCAB_COLLECTION, vocab_id);
    await setDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  }

  /**
   * Add a new vocabulary item to master collection
   * (Admin only operation)
   */
  static async addMasterVocabularyItem(vocab: VocabItem): Promise<void> {
    const docRef = doc(db, MASTER_VOCAB_COLLECTION, vocab.id);
    await setDoc(docRef, {
      ...vocab,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

// For direct console access during development
if (typeof window !== 'undefined') {
  (window as any).VocabularyMigration = VocabularyMigration;
}
