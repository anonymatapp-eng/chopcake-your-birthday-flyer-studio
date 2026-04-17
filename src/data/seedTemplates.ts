import type { Template } from "@/types";
import tplConfetti from "@/assets/tpl-confetti.jpg";
import tplWave from "@/assets/tpl-wave.jpg";
import tplGold from "@/assets/tpl-gold.jpg";
import tplFloral from "@/assets/tpl-floral.jpg";

// CSS gradient backgrounds rendered as SVG data URLs (no external image needed)
function gradientSvg(stops: string, name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs><rect width="1080" height="1920" fill="url(%23g)"/></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23").replace(/"/g, "'")}`;
}

const midnight = gradientSvg(
  `<stop offset='0%25' stop-color='%23241046'/><stop offset='60%25' stop-color='%23120726'/><stop offset='100%25' stop-color='%2306030f'/>`,
  "midnight",
);
const balloons = gradientSvg(
  `<stop offset='0%25' stop-color='%23ffd6e7'/><stop offset='100%25' stop-color='%23ffb39c'/>`,
  "balloons",
);

export const seedTemplates: Template[] = [
  {
    id: "tpl-confetti",
    name: "Confetti Joy",
    emoji: "🎊",
    category: "Vibrant",
    background: tplConfetti,
    photoZone: { x: 0.18, y: 0.18, w: 0.64, h: 0.4 },
    nameZone: { x: 0.08, y: 0.62, w: 0.84, h: 0.1 },
    messageZone: { x: 0.1, y: 0.78, w: 0.8, h: 0.12 },
    nameColor: "#ffffff",
    messageColor: "#ffffff",
    active: true,
    usageCount: 42,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "tpl-midnight",
    name: "Midnight Glow",
    emoji: "✨",
    category: "Elegant",
    background: midnight,
    photoZone: { x: 0.2, y: 0.16, w: 0.6, h: 0.38 },
    nameZone: { x: 0.08, y: 0.6, w: 0.84, h: 0.1 },
    messageZone: { x: 0.12, y: 0.76, w: 0.76, h: 0.12 },
    nameColor: "#fbbf24",
    messageColor: "#f5e6d3",
    active: true,
    usageCount: 31,
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    id: "tpl-balloons",
    name: "Soft Pastel",
    emoji: "🎈",
    category: "Cute",
    background: balloons,
    photoZone: { x: 0.22, y: 0.2, w: 0.56, h: 0.36 },
    nameZone: { x: 0.08, y: 0.6, w: 0.84, h: 0.1 },
    messageZone: { x: 0.12, y: 0.76, w: 0.76, h: 0.12 },
    nameColor: "#7c2d4a",
    messageColor: "#7c2d4a",
    active: true,
    usageCount: 28,
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: "tpl-wave",
    name: "Ocean Wave",
    emoji: "🌊",
    category: "Modern",
    background: tplWave,
    photoZone: { x: 0.18, y: 0.06, w: 0.64, h: 0.4 },
    nameZone: { x: 0.08, y: 0.5, w: 0.84, h: 0.1 },
    messageZone: { x: 0.12, y: 0.66, w: 0.76, h: 0.12 },
    nameColor: "#ffffff",
    messageColor: "#dbeafe",
    active: true,
    usageCount: 19,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "tpl-gold",
    name: "Golden Hour",
    emoji: "🌟",
    category: "Vibrant",
    background: tplGold,
    photoZone: { x: 0.2, y: 0.32, w: 0.6, h: 0.38 },
    nameZone: { x: 0.08, y: 0.74, w: 0.84, h: 0.08 },
    messageZone: { x: 0.12, y: 0.85, w: 0.76, h: 0.1 },
    nameColor: "#7a3f00",
    messageColor: "#7a3f00",
    active: true,
    usageCount: 15,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "tpl-floral",
    name: "Floral Charm",
    emoji: "🌸",
    category: "Elegant",
    background: tplFloral,
    photoZone: { x: 0.22, y: 0.18, w: 0.56, h: 0.34 },
    nameZone: { x: 0.12, y: 0.56, w: 0.76, h: 0.08 },
    messageZone: { x: 0.15, y: 0.7, w: 0.7, h: 0.12 },
    nameColor: "#ffffff",
    messageColor: "#fce7f3",
    active: true,
    usageCount: 22,
    createdAt: Date.now() - 86400000 * 1,
  },
];
