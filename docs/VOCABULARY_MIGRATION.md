# 🔧 Master Vocabulary Migration Guide

## Overview
This guide explains how to migrate vocabulary data from local storage to a shared Firestore collection that all users can access.

## 📁 Files Created

1. **`src/services/vocabularyMigration.ts`** - Migration script with batch operations
2. **`src/services/cloudStorageService.ts`** - Added master vocabulary methods
3. **`src/components/admin/MigrationPanel.tsx`** - Admin UI component

---

## 🚀 Quick Start

### Method 1: Using Browser Console (Recommended for first-time setup)

1. **Login to your app** as an admin user with Firestore write permissions
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Run the migration:**

```javascript
// The migration class is globally available via window
await window.VocabularyMigration.seedMasterVocabulary();
```

4. **Verify the migration:**

```javascript
// Check if vocabulary is seeded
const isSeeded = await window.VocabularyMigration.isMasterVocabularySeeded();
console.log('Is seeded:', isSeeded);

// Get count
const count = await window.VocabularyMigration.getMasterVocabularyCount();
console.log('Vocabulary count:', count);
```

### Method 2: Using Admin UI Component

1. **Add MigrationPanel to Settings page:**

```tsx
// In src/pages/Settings.tsx
import MigrationPanel from '@/components/admin/MigrationPanel';

// Add to your component:
<MigrationPanel />
```

2. **Click "Seed Master Vocabulary"** button in the UI
3. **Status will be displayed** in the panel

---

## 🗄️ Database Structure

After migration, your Firestore will have:

```
firestore/
├── vocabulary/                    # ← Master collection (read-only for users)
│   ├── 1/
│   │   ├── id: "1"
│   │   ├── vi: "Xin chào"
│   │   ├── jp: "こんにちは (Konnichiwa)"
│   │   ├── en: "Hello"
│   │   ├── type: "word"
│   │   ├── created_at: "2026-01-30T03:20:00Z"
│   │   └── updated_at: "2026-01-30T03:20:00Z"
│   ├── 2/ ...
│   └── 6/ ...
│
└── users/
    └── {userId}/
        ├── pronunciation_results/
        │   └── {vocab_id}/
        │       ├── vocab_id: "1"  # ← References master vocab
        │       ├── response: {...}
        │       ├── averageOverallScore: 85
        │       └── updated_at: timestamp
        └── preferences/ ...
```

---

## 🔒 Firestore Security Rules

Add these rules to allow read access to master vocabulary:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Master vocabulary: Read-only for authenticated users
    match /vocabulary/{vocabId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via backend/admin tools
    }
    
    // User data: Owner only
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📝 API Usage

### Read Master Vocabulary

```typescript
import { cloudStorageService } from '@/services/cloudStorageService';

// Get all vocabulary
const vocabulary = await cloudStorageService.getMasterVocabulary();
console.log(vocabulary); // Array of VocabItem[]

// Get single item
const item = await cloudStorageService.getMasterVocabularyItem('1');
console.log(item); // VocabItem or null
```

### Admin Operations

```typescript
import { VocabularyMigration } from '@/services/vocabularyMigration';

// Add new vocabulary item (admin only)
await VocabularyMigration.addMasterVocabularyItem({
  id: '7',
  vi: 'Chào buổi sáng',
  jp: 'おはようございます',
  en: 'Good morning',
  type: 'phrase'
});

// Update existing item (admin only)
await VocabularyMigration.updateMasterVocabularyItem('1', {
  jp: 'こんにちは (Konnichiwa) - Updated'
});
```

---

## ✅ Next Steps

After running the migration, you should:

1. **Update `storageService.ts`** to read from master collection instead of local storage
2. **Implement caching** to reduce Firestore reads
3. **Test with multiple users** to ensure shared access works
4. **Remove per-user vocabulary storage** (optional, for cleanup)

---

## 💡 Benefits

- ✅ **Single source of truth** - All users see the same vocabulary
- ✅ **Easy updates** - Change once, affects all users
- ✅ **Cost efficient** - No data duplication
- ✅ **Scalable** - Add new vocabulary items easily

---

## ⚠️ Important Notes

1. **Run once only** - The migration only needs to be executed once during initial setup
2. **Backup data** - Ensure you have backups before running migration
3. **Admin access required** - You need proper Firestore write permissions
4. **Batch limit** - Script handles up to 500 items per batch (current: 6 items)

---

## 🐛 Troubleshooting

### Error: "Permission denied"
- Ensure you're logged in with an account that has Firestore write access
- Check your Firebase security rules

### Error: "Collection not found"
- The collection will be created automatically on first write
- Ensure Firebase is properly initialized

### Vocabulary count is 0 after migration
- Check browser console for errors
- Verify Firebase connection
- Ensure VOCAB_DATA constant is properly imported

---

## 📊 Monitoring

Check migration status anytime:

```javascript
// In browser console
const count = await window.VocabularyMigration.getMasterVocabularyCount();
console.log(`Master vocabulary has ${count} items`);
```
