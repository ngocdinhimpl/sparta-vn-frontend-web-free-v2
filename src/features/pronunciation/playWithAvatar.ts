import { WordTimeline } from "@/types";
import { getAvatarFromScore, sleep } from "@/utils/utils";
import { AvatarController } from "../avatar/AvatarController";

export async function playWithAvatar(
  words: WordTimeline[],
  avatar: AvatarController,
  audioStartTime = 0,
  onWordHighlight?: (index: number) => void
) {
  const start = Date.now();

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const elapsed = Date.now() - start;
    const waitTime = audioStartTime + w.startMs - elapsed;

    if (waitTime > 0) {
      await sleep(waitTime);
    }

    const mood = getAvatarFromScore(w.accuracy);
    avatar.transitionTo(mood);
    
    // Trigger word highlight callback
    if (onWordHighlight) {
      onWordHighlight(i);
    }
  }
  
  // Keep last word highlighted for its duration
  if (words.length > 0 && onWordHighlight) {
    const lastWord = words[words.length - 1];
    const lastWordDuration = lastWord.endMs - lastWord.startMs;
    await sleep(lastWordDuration);
    onWordHighlight(-1);
  }
}
