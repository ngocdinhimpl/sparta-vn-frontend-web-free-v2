import axios from 'axios';
import { audioRecordingService } from './AudioRecordingService';

// Use relative URL to go through Vite proxy (avoids CORS)
const API_URL = '/api';

/* ===================== TYPES ===================== */

export interface PronunciationScore {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
}

export interface PhonemeAssessment {
  AccuracyScore: number;
}

export interface Phoneme {
  Phoneme: string;
  PronunciationAssessment: PhonemeAssessment;
  Offset: number;
  Duration: number;
}

export interface WordAssessment {
  AccuracyScore: number;
  ErrorType: string;
}

export interface Word {
  Word: string;
  Offset: number;
  Duration: number;
  PronunciationAssessment: WordAssessment;
  Phonemes: Phoneme[];
}

export type AvatarMood = 'happy' | 'neutral' | 'angry';

export interface PronunciationResult {
  text: string;
  score: PronunciationScore;
  words: Word[];
  avatarMood: AvatarMood;
  audioUrl?: string;
}

/**
 * Check pronunciation by sending audio blob to server
 * @param audioBlob - The recorded audio blob
 * @param referenceText - The expected text to compare against
 * @returns Promise with pronunciation analysis result
 */
export async function checkPronunciation(
  audioBlob: Blob,
  referenceText: string
): Promise<PronunciationResult> {
  const formData = new FormData();

  // Convert blob to file for FormData
  const audioFile = new File([audioBlob], 'audio.wav', {
    type: audioBlob.type || 'audio/wav',
  });

  formData.append('audio', audioFile);
  formData.append('referenceText', referenceText);

  const response = await axios.post<PronunciationResult>(
    `${API_URL}/pronunciation`,
    formData,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    }
  );

  return response.data;
}

/**
 * Check pronunciation using recording ID from IndexedDB
 * @param recordingId - The ID of the saved recording
 * @param referenceText - The expected text to compare against
 * @returns Promise with pronunciation analysis result
 */
export async function checkPronunciationById(
  recordingId: string,
  referenceText: string
): Promise<PronunciationResult> {
  // Import dynamically to avoid circular dependency
  
  const blob = await audioRecordingService.getRecording(recordingId);
  
  if (!blob) {
    throw new Error('Recording not found');
  }

  return checkPronunciation(blob, referenceText);
}

/**
 * Upload an audio blob to Google Drive via backend
 * Server stores on Drive and returns a proxy audioUrl for playback
 */
export async function uploadAudioToCloud(
  blob: Blob,
  fileName: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    const audioFile = new File([blob], fileName, {
      type: blob.type || 'audio/wav',
    });
    formData.append('audio', audioFile);

    const { data } = await axios.post(
      `${API_URL}/upload/audio`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );

    if (!data.success || !data.data?.audioUrl) {
      throw new Error('Failed to upload audio to Drive');
    }

    return data.data.audioUrl; // e.g. /api/upload/audio/:fileId
  } catch (error) {
    console.error('Error uploading audio to Drive:', error);
    return null;
  }
}

export default {
  checkPronunciation,
  checkPronunciationById,
};
