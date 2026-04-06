import { AvatarMood } from "@/services/api";
import { WordTimeline } from "@/types";


export function getAvatarFromScore(score: number): AvatarMood {
  if (score >= 80) return "happy";
  if (score >= 65) return "neutral";
  return "angry";
}

export function getWordColor(score: number) {
  if (score >= 80) return "#2ecc71"; // xanh
  if (score >= 65) return "#f1c40f"; // vàng
  return "#e74c3c"; // đỏ
}

export function parseWords(apiWords: any[]): WordTimeline[] {
  return apiWords.map(w => {
    const startMs = w.Offset / 10000;
    const durationMs = w.Duration / 10000;

    return {
      word: w.Word,
      startMs,
      endMs: startMs + durationMs,
      accuracy: w.PronunciationAssessment.AccuracyScore,
    };
  });
}

export function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

