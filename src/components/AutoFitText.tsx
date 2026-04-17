import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  width: number; // px
  height: number; // px
  color: string;
  weight?: number;
  fontFamily?: string;
  minSize?: number;
  maxSize?: number;
  align?: "center" | "left";
  className?: string;
}

// Auto-fits text into a box by binary-searching font-size.
// Uses word wrapping only (no letter wrapping or hyphenation).
export default function AutoFitText({
  text,
  width,
  height,
  color,
  weight = 700,
  fontFamily = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif",
  minSize = 8,
  maxSize = 200,
  align = "center",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(maxSize);

  useEffect(() => {
    if (!ref.current || !text) return;
    const el = ref.current;
    let lo = minSize;
    let hi = maxSize;
    let best = minSize;
    // Binary search for the largest font-size that fits
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}px`;
      // Force reflow
      const fits = el.scrollWidth <= width + 1 && el.scrollHeight <= height + 1;
      if (fits) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
      if (hi - lo < 0.5) break;
    }
    setSize(best);
  }, [text, width, height, minSize, maxSize, fontFamily, weight]);

  return (
    <div
      style={{ width, height, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start" }}
      className={className}
    >
      <div
        ref={ref}
        style={{
          fontSize: size,
          color,
          fontWeight: weight,
          fontFamily,
          lineHeight: 1.1,
          textAlign: align,
          width: "100%",
          letterSpacing: "-0.02em",
          whiteSpace: "pre-wrap",
          wordBreak: "normal",
          overflowWrap: "normal",
          hyphens: "none",
          textShadow: "0 2px 12px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
