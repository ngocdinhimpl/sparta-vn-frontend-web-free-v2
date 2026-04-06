import { useRef, useState } from "react";
import { AvatarMood } from "@/services/api";
import { AvatarController } from "./AvatarController";

export function useAvatar(initialMood?: AvatarMood, avatarId: string = 'avatar1') {
  const [image, setImage] = useState<string | null>(null);
  const controllerRef = useRef<AvatarController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AvatarController(setImage, initialMood, avatarId);
  }

  return {
    image,
    controller: controllerRef.current,
  };
}
