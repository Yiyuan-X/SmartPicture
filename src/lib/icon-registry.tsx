import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Camera,
  ArrowRight,
  Globe2,
  Laptop,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Video,
  BookOpen,
} from "lucide-react";

export const iconRegistry = {
  sparkles: Sparkles,
  "message-square": MessageSquare,
  video: Video,
  "book-open": BookOpen,
  "globe-2": Globe2,
  camera: Camera,
  layers: Layers,
  bot: Bot,
  laptop: Laptop,
  "shield-check": ShieldCheck,
  "arrow-right": ArrowRight,
} as const;

export type IconName = keyof typeof iconRegistry;

export function resolveIcon(name: IconName): LucideIcon {
  return iconRegistry[name];
}
