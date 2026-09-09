/**
 * Central analytics facade — Firebase Analytics SDK only (no gtag.js).
 * All tracking in the app should go through this module.
 */
import {
  logEvent,
  setUserProperties,
  setUserId,
  Analytics,
} from 'firebase/analytics';
import { analyticsReady } from './firebase';

export type AnalyticsParams = Record<string, string | number | boolean | undefined | null>;

const IS_DEV = import.meta.env.DEV;

const PAGE_TITLES: Record<string, string> = {
  '/home': 'Home',
  '/training/modes': 'Training Modes',
  '/training/stages': 'Stage Selection',
  '/training/vocab': 'Vocabulary List',
  '/training/pronunciation': 'Pronunciation Practice',
  '/training/result': 'Pronunciation Result',
  '/history': 'History',
  '/weak-sounds': 'Weak Sounds',
  '/ranking': 'Ranking',
  '/settings': 'Settings',
  '/feedback': 'Feedback',
  '/avatar-selection': 'Avatar Selection',
  '/auth/terms': 'Terms of Use',
  '/auth/login': 'Login',
  '/auth/register': 'Register',
  '/level-completion': 'Level Completion',
};

function sanitizeParams(params?: AnalyticsParams): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    clean[key] = value;
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

/** Dev-only: attach debug_mode so GA4 DebugView picks up the session. */
function withDebugParams(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!IS_DEV) return params;
  return { ...params, debug_mode: true };
}

function debugLog(kind: 'event' | 'page_view' | 'user_props', detail: unknown): void {
  if (!IS_DEV) return;
  // Prefix without square brackets so Tailwind content scan does not emit a bogus utility.
  console.log(`analytics/dev ${kind}`, detail);
}

function withAnalytics(action: (instance: Analytics) => void, droppedLabel?: string): void {
  void analyticsReady
    .then((instance) => {
      if (!instance) {
        if (IS_DEV) {
          console.warn(
            'analytics/dev skipped — Analytics instance is null.',
            droppedLabel ?? '',
            'Check VITE_GA_MEASUREMENT_ID and firebase init warnings above.'
          );
        }
        return;
      }
      action(instance);
    })
    .catch((error) => {
      if (IS_DEV) {
        console.warn('[analytics] failed:', error);
      }
    });
}

/** Fire a custom GA4 event. */
export function trackEvent(name: string, params?: AnalyticsParams): void {
  const payload = withDebugParams(params);
  debugLog('event', { name, params: sanitizeParams(payload) });

  withAnalytics((instance) => {
    try {
      logEvent(instance, name, sanitizeParams(payload));
    } catch (error) {
      if (IS_DEV) {
        console.warn('[analytics] trackEvent failed:', name, error);
      }
    }
  }, `event:${name}`);
}

/**
 * Manual page_view for SPA without React Router.
 * Use virtual paths like "/training/pronunciation".
 */
export function trackPageView(path: string, title?: string): void {
  const pageTitle = title ?? PAGE_TITLES[path] ?? path;
  const params: AnalyticsParams = {
    page_path: path,
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? `${window.location.origin}${path}` : path,
  };

  debugLog('page_view', params);
  // trackEvent also logs in DEV; that's intentional (page_view path + final event payload with debug_mode)
  trackEvent('page_view', params);
}

/** Set GA4 user properties (custom dimensions). */
export function setUserProps(props: AnalyticsParams): void {
  const clean = sanitizeParams(props);
  debugLog('user_props', clean);

  withAnalytics((instance) => {
    try {
      if (!clean) return;
      setUserProperties(instance, clean);
    } catch (error) {
      if (IS_DEV) {
        console.warn('[analytics] setUserProps failed:', error);
      }
    }
  }, 'setUserProps');
}

/** Bind Firebase Auth uid to Analytics (anonymous or registered). */
export function setAnalyticsUserId(uid: string | null): void {
  withAnalytics((instance) => {
    try {
      setUserId(instance, uid);
      if (IS_DEV) {
        console.log('analytics/dev setUserId', uid);
      }
    } catch (error) {
      if (IS_DEV) {
        console.warn('[analytics] setUserId failed:', error);
      }
    }
  }, 'setUserId');
}

/* ===================== Domain helpers ===================== */

export function trackLessonStart(params: {
  mode: string;
  stage?: number;
  vocabId: string;
}): void {
  trackEvent('lesson_start', {
    mode: params.mode,
    stage: params.stage,
    vocab_id: params.vocabId,
  });
}

export function trackPronunciationSubmit(params: {
  vocabId: string;
  scoreOverall: number;
  scoreAccuracy: number;
  scoreFluency: number;
  scoreCompleteness: number;
  scoreProsody: number;
}): void {
  trackEvent('pronunciation_submit', {
    vocab_id: params.vocabId,
    score_overall: params.scoreOverall,
    score_accuracy: params.scoreAccuracy,
    score_fluency: params.scoreFluency,
    score_completeness: params.scoreCompleteness,
    score_prosody: params.scoreProsody,
  });
}

export function trackPronunciationError(params: {
  vocabId: string;
  errorType: string;
}): void {
  trackEvent('pronunciation_error', {
    vocab_id: params.vocabId,
    error_type: params.errorType,
  });
}

export function trackLevelChange(
  direction: 'up' | 'down',
  fromLevel: number,
  toLevel: number
): void {
  trackEvent(direction === 'up' ? 'level_up' : 'level_down', {
    from_level: fromLevel,
    to_level: toLevel,
  });
}

export function trackAvatarSelected(avatarId: string, isFirstTime: boolean): void {
  trackEvent('avatar_selected', {
    avatar_id: avatarId,
    is_first_time: isFirstTime,
  });
}

export function trackRankingView(levelTab: 0 | 8): void {
  trackEvent('ranking_view', { level_tab: levelTab });
}

export function trackFeedbackSubmit(contentLength: number): void {
  trackEvent('feedback_submit', { content_length: contentLength });
}

export function trackUiClick(params: {
  elementId: string;
  elementText?: string;
  location?: string;
}): void {
  trackEvent('ui_click', {
    element_id: params.elementId,
    element_text: params.elementText,
    click_location: params.location,
  });
}

export default {
  trackEvent,
  trackPageView,
  setUserProps,
  setAnalyticsUserId,
};
