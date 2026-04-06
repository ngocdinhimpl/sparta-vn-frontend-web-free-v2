import { getAvatarTransitions } from "@/constants";
import { AvatarMood } from "@/services/api";
import { sleep } from "@/utils/utils";

export class AvatarController {
  private currentMood: AvatarMood = "neutral";
  private setImage: (img: string) => void;
  private avatarId: string;
  private transitions: Record<AvatarMood, Partial<Record<AvatarMood, any[]>>>;

  constructor(setImage: (img: string) => void, initialMood?: AvatarMood, avatarId: string = 'avatar1') {
    this.setImage = setImage;
    this.avatarId = avatarId;
    this.transitions = getAvatarTransitions(avatarId);
    if (initialMood) {
      this.setInitialMood(initialMood);
    }
  }

  async transitionTo(nextMood: AvatarMood) {
    console.log(this.currentMood, nextMood);
    const frames = this.transitions[this.currentMood]?.[nextMood];
    console.log(frames);

    if (!frames || frames.length === 0) {
      this.currentMood = nextMood;
      return;
    }

    for (const frame of frames) {
      this.setImage(frame);
      await sleep(30);
    }

    this.currentMood = nextMood;
  }

  setInitialMood(mood: AvatarMood) {
    this.currentMood = mood;
    const frames = this.transitions[mood]?.[mood];
    if (frames && frames.length > 0) {
      this.setImage(frames[0]);
    }
  }

  getCurrentMood(): AvatarMood {
    return this.currentMood;
  }
}
