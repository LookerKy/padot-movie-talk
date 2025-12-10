import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TAG_COLORS = [
  "#FF6B6B", // Pastel Red
  "#4ECDC4", // Pastel Teal
  "#45B7D1", // Pastel Blue
  "#96CEB4", // Pastel Green
  "#FFEEAD", // Pastel Yellow
  "#D4A5A5", // Pastel Pink
  "#9B59B6", // Pastel Purple
  "#3498DB", // Blue
  "#E67E22", // Orange
  "#1ABC9C", // Turquoise
];
