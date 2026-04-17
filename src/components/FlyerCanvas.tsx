import { forwardRef, useEffect, useRef, useState } from "react";
import type { Template } from "@/types";
import AutoFitText from "@/components/AutoFitText";

export interface PhotoAdjust {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface Props {
  template: Template;
  name: string;
  message: string;
  photo?: string;
  photoAdjust?: PhotoAdjust;
  watermark?: boolean;
  // Render width in px — height auto-derived from 1:1 ratio
  width?: number;
  className?: string;
  showZones?: boolean;
}

const RATIO = 1;

const FlyerCanvas = forwardRef<HTMLDivElement, Props>(function FlyerCanvas(
  {
    template,
    name,
    message,
    photo,
    photoAdjust = { scale: 1, offsetX: 0, offsetY: 0 },
    watermark = true,
    width = 360,
    className,
    showZones = false,
  },
  ref,
) {
  const height = width / RATIO;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: width, h: height });

  // Fallback: keep a placeholder photo silhouette when none provided
  useEffect(() => {
    setSize({ w: width, h: width / RATIO });
  }, [width]);

  const px = (z: { x: number; y: number; w: number; h: number }) => ({
    left: z.x * size.w,
    top: z.y * size.h,
    width: z.w * size.w,
    height: z.h * size.h,
  });

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as any).current = el;
      }}
      className={className}
      style={{
        width: size.w,
        height: size.h,
        position: "relative",
        overflow: "hidden",
        borderRadius: 24,
        backgroundColor: "#111",
        backgroundImage: `url(${template.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
      }}
    >
      {/* Photo zone */}
      <div
        style={{
          position: "absolute",
          ...px(template.photoZone),
          borderRadius: 16,
          overflow: "hidden",
          background: photo ? "transparent" : "rgba(255,255,255,0.08)",
          border: photo ? "none" : "2px dashed rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transformOrigin: "center center",
              transform: `translate(${photoAdjust.offsetX * 100}%, ${photoAdjust.offsetY * 100}%) scale(${photoAdjust.scale})`,
            }}
          />
        ) : (
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Photo</span>
        )}
      </div>

      {/* Name zone */}
      <div style={{ position: "absolute", ...px(template.nameZone) }}>
        <AutoFitText
          text={name || "Their Name"}
          width={template.nameZone.w * size.w}
          height={template.nameZone.h * size.h}
          color={template.nameColor}
          weight={800}
          maxSize={Math.floor(template.nameZone.h * size.h)}
        />
      </div>

      {/* Message zone */}
      <div style={{ position: "absolute", ...px(template.messageZone) }}>
        <AutoFitText
          text={message || "Your warm message here"}
          width={template.messageZone.w * size.w}
          height={template.messageZone.h * size.h}
          color={template.messageColor}
          weight={500}
          maxSize={Math.floor(template.messageZone.h * size.h * 0.55)}
        />
      </div>

      {/* Zone outlines for admin editor */}
      {showZones && (
        <>
          <ZoneOutline label="Photo" color="#f472b6" {...px(template.photoZone)} />
          <ZoneOutline label="Name" color="#fbbf24" {...px(template.nameZone)} />
          <ZoneOutline label="Message" color="#2dd4bf" {...px(template.messageZone)} />
        </>
      )}

      {watermark && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
            fontSize: Math.max(8, size.w * 0.025),
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
            letterSpacing: 0.4,
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          Made with ChopCake
        </div>
      )}
    </div>
  );
});

function ZoneOutline({
  label,
  color,
  left,
  top,
  width,
  height,
}: {
  label: string;
  color: string;
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: `2px dashed ${color}`,
        borderRadius: 8,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 6,
          background: color,
          color: "#0b0617",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 6,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default FlyerCanvas;
