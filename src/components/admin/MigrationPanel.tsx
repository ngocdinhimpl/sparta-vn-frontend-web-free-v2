/**
 * Migration UI Component
 * 
 * This component provides a UI to run the vocabulary migration.
 * Add this to Settings page for admins.
 */

import React, { useState } from 'react';
import { VocabularyMigration } from '@/services/vocabularyMigration';

const MigrationPanel: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const handleSeedVocabulary = async () => {
    setLoading(true);
    setStatus('Starting migration...');
    
    const result = await VocabularyMigration.seedMasterVocabulary();
    
    if (result.success) {
      setStatus(`✅ ${result.message}`);
    } else {
      setStatus(`❌ ${result.message}`);
    }
    
    setLoading(false);
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    const isSeeded = await VocabularyMigration.isMasterVocabularySeeded();
    const vocabCount = await VocabularyMigration.getMasterVocabularyCount();
    
    setCount(vocabCount);
    setStatus(
      isSeeded 
        ? `✅ Master vocabulary is seeded (${vocabCount} items)` 
        : '⚠️ Master vocabulary not seeded yet'
    );
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        🔧 Vocabulary Migration
      </h3>
      
      <p className="text-sm text-slate-600 mb-6">
        Run this migration once to seed the master vocabulary collection that all users will share.
      </p>

      <div className="space-y-3">
        <button
          onClick={handleCheckStatus}
          disabled={loading}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-2xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        <button
          onClick={handleSeedVocabulary}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Migrating...' : 'Seed Master Vocabulary'}
        </button>
      </div>

      {status && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
          <p className="text-sm font-medium text-slate-700">{status}</p>
          {count !== null && (
            <p className="text-xs text-slate-500 mt-1">
              Total items: {count}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-xs text-amber-800">
          <strong>⚠️ Admin Only:</strong> This operation should only be run once during initial setup.
          It will create a shared vocabulary collection in Firestore.
        </p>
      </div>
    </div>
  );
};

export default MigrationPanel;
