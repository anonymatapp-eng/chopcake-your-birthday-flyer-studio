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

export const seedTemplates: Template[] = [];
