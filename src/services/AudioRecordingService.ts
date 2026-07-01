/**
 * AudioRecordingService - Manages audio recording and playback
 * Stores recordings in IndexedDB by unique ID
 */

import { getSpeechRecordingConstraints, normalizeAudioSamples } from './audioProcessing';

const DB_NAME = 'SpartaAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private WAV_SAMPLE_RATE = 16000; // Expected by Azure/Server

  // Silence Detection
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceTimer: number | null = null;
  private onSilenceDetected: (() => void) | null = null;
  private SILENCE_THRESHOLD = 0.01; // Reverted to original value for testing
  private SILENCE_DURATION = 1500; // 1.5 seconds

  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;

  private db: IDBDatabase | null = null;

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
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

  /* ===================== RECORD ===================== */

  async startRecording(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Trình duyệt không hỗ trợ ghi âm');
    }

    this.audioChunks = [];

    this.stream = await navigator.mediaDevices.getUserMedia(getSpeechRecordingConstraints());

    const mimeType =
      MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

    const options = mimeType ? { mimeType } : {};
    if (!this.stream) throw new Error('Không có stream âm thanh');
    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data);
        console.log(`📥 Received audio data: ${e.data.size} bytes`);
      }
    };

    if (this.onSilenceDetected) {
      this.setupSilenceDetection();
    }

    this.mediaRecorder.start(100);
    console.log('⏺️ Recording started');
  }

  private setupSilenceDetection() {
    if (!this.stream) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    let lastTimeSpeaking = Date.now();
    let hasSpoken = false;

    const checkSilence = () => {
      if (!this.analyser || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        return;
      }

      this.analyser.getFloatTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) for volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Periodically log volume for calibration if needed
      if (Math.random() < 0.05) { // Log ~5% of frames to avoid console flooding
        console.log(`🎤 Current Volume (RMS): ${rms.toFixed(4)} (Threshold: ${this.SILENCE_THRESHOLD})`);
      }

      if (rms > this.SILENCE_THRESHOLD) {
        lastTimeSpeaking = Date.now();
        hasSpoken = true;
      } else if (hasSpoken && (Date.now() - lastTimeSpeaking > this.SILENCE_DURATION)) {
        console.log('🤫 Silence detected, auto-stopping...');
        this.onSilenceDetected?.();
        return;
      }

      requestAnimationFrame(checkSilence);
    };

    requestAnimationFrame(checkSilence);
  }

  setSilenceCallback(callback: (() => void) | null) {
    this.onSilenceDetected = callback;
  }

  stopRecording(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!this.mediaRecorder) {
      reject(new Error('No recording in progress'));
      return;
    }

    const recorder = this.mediaRecorder;

    recorder.onstop = async () => {
      try {
        // 🔑 Create blob ONLY AFTER recorder fully stopped
        const blob = new Blob(this.audioChunks, {
          type: recorder.mimeType || 'audio/webm',
        });

        if (blob.size === 0) {
          console.error('Recording blob is empty');
          reject(new Error('Recording failed (empty audio)'));
          return;
        }

        try {
          // Convert the raw blob (webm/mp4) to a 16kHz mono WAV blob
          const wavBlob = await this.convertTo16kHzWav(blob);

          const db = await this.getDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          store.put({
            id,
            blob: wavBlob,
            createdAt: new Date().toISOString(),
            size: wavBlob.size,
          });

          resolve();
        } catch (convertErr) {
          console.error('Error converting audio to WAV:', convertErr);
          reject(convertErr);
        }
      } catch (err) {
        reject(err);
      } finally {
        // cleanup
        this.audioChunks = [];
        this.mediaRecorder = null;

        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
        this.analyser = null;

        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
          this.stream = null;
        }
      }
    };

    // ⛔ DO NOT requestData + timeout
    recorder.stop();
  });
}


  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /* ===================== BROWSER AUDIO PROCESSING ===================== */

  private async convertTo16kHzWav(blob: Blob): Promise<Blob> {
    // 1. Decode original blob
    const arrayBuffer = await blob.arrayBuffer();
    const actx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.WAV_SAMPLE_RATE, // Request native resampling to 16kHz if supported
    });
    
    const audioBuffer = await actx.decodeAudioData(arrayBuffer);
    
    // 2. Mix down to mono
    let channelData = audioBuffer.getChannelData(0);
    if (audioBuffer.numberOfChannels > 1) {
      // Simple average for stereo -> mono
      const rightChannel = audioBuffer.getChannelData(1);
      const monoData = new Float32Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        monoData[i] = (channelData[i] + rightChannel[i]) / 2;
      }
      channelData = monoData;
    }

    const normalizedData = normalizeAudioSamples(channelData);

    // 3. Encode to 16-bit PCM WAV
    const wavBuffer = this.encodeWAV(normalizedData, this.WAV_SAMPLE_RATE);
    
    actx.close();
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format size
    view.setUint16(20, 1, true);  // Audio format 1 = PCM
    view.setUint16(22, 1, true);  // Num channels (1 = mono)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true);  // Block align (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // Bits per sample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write audio data (16-bit PCM)
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      // Convert Float32 (-1.0 to 1.0) to Int16
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  }

  /* ===================== PLAYBACK ===================== */

  async playRecording(id: string, onEnded?: () => void): Promise<boolean> {
    const blob = await this.getRecording(id);
    if (!blob) return false;

    this.stopPlayback();

    this.currentAudioUrl = URL.createObjectURL(blob);
    this.currentAudio = new Audio(this.currentAudioUrl);

    this.currentAudio.onended = () => {
      this.cleanupAudioUrl();
      onEnded?.();
    };

    try {
      await this.currentAudio.play();
      return true;
    } catch (err) {
      console.warn('Audio play failed:', err);
      this.cleanupAudioUrl();
      return false;
    }
  }

  stopPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.cleanupAudioUrl();
  }

  isPlaying(): boolean {
    return !!this.currentAudio && !this.currentAudio.paused;
  }

  private cleanupAudioUrl() {
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  /* ===================== STORAGE ===================== */

  async getRecording(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.blob ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async downloadAudioFromUrl(id: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
      
      const blob = await response.blob();
      
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      store.put({
        id,
        blob,
        createdAt: new Date().toISOString(),
        size: blob.size,
      });
    } catch (error) {
      console.error('Error downloading audio from URL:', error);
      throw error;
    }
  }

  /**
   * Get duration of a recording in seconds
   */
  async getRecordingDuration(id: string): Promise<number> {
    const blob = await this.getRecording(id);
    if (!blob) return 0;

    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
      
      audio.src = url;
    });
  }

  async deleteRecording(id: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  }

  async getAllRecordingIds(): Promise<string[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => resolve([]);
    });
  }

  async clearAllRecordings(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  }
}

export const audioRecordingService = new AudioRecordingService();
export default AudioRecordingService;
