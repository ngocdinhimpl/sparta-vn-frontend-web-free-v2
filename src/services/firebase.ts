import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

/** Prefer env; set VITE_GA_MEASUREMENT_ID in .env.local / hosting env. */
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

const firebaseConfig = {
  apiKey: "AIzaSyD6VQ73KWH5mMvScFNgQ-5HVz6tBPmg3mI",
  authDomain: "sparta-65241.firebaseapp.com",
  projectId: "sparta-65241",
  storageBucket: "sparta-65241.firebasestorage.app",
  messagingSenderId: "288816784917",
  appId: "1:288816784917:web:7ead1b3d110991ad77d01c",
  measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Analytics is initialized when the environment supports it.
 * Do not load a separate gtag.js snippet — that would double-count with this SDK.
 * Prefer awaiting `analyticsReady` (via analyticsService) before logging.
 */
export let analytics: Analytics | null = null;

const isDev = import.meta.env.DEV;

function logInit(level: 'info' | 'warn', message: string, detail?: unknown): void {
  if (!isDev) return;
  if (level === 'info') {
    console.info(message, detail ?? '');
  } else {
    console.warn(message, detail ?? '');
  }
}

export const analyticsReady: Promise<Analytics | null> =
  typeof window === 'undefined'
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => {
          if (!supported) {
            logInit(
              'warn',
              'firebase/dev Analytics not initialized: isSupported() returned false ' +
                '(browser may block cookies/storage, or environment is unsupported).'
            );
            return null;
          }

          if (!measurementId || measurementId === 'G-XXXXXXX') {
            logInit(
              'warn',
              'firebase/dev Analytics not initialized: missing or placeholder VITE_GA_MEASUREMENT_ID. ' +
                'Set it in .env.local / hosting env and restart the app.'
            );
            return null;
          }

          analytics = getAnalytics(app);
          logInit(
            'info',
            `firebase/dev Analytics initialized (measurementId=${measurementId}, debug_mode events enabled in DEV).`
          );
          return analytics;
        })
        .catch((err) => {
          logInit('warn', 'firebase/dev Analytics not available:', err);
          return null;
        });

export default app;
