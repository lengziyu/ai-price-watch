"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type HeroMeshProps = {
  className?: string;
};

type MeshPoint = {
  anchorX: number;
  anchorY: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  driftPhaseX: number;
  driftPhaseY: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

const meshSpacing = 28;
const meshAmplitude = 3.4;
const meshInfluenceRadius = 132;
const meshSpring = 0.082;
const meshDamping = 0.84;

export function HeroMesh({ className }: HeroMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const host = canvas.parentElement;
    const heroStage = canvas.closest(".hero-stage, .hero-grid, .hero-mesh-shell");

    if (!(host instanceof HTMLElement) || !(heroStage instanceof HTMLElement)) {
      return;
    }

    const mediaQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    if (mediaQuery?.matches) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let points: MeshPoint[] = [];

    const pointer: PointerState = {
      active: false,
      x: 0,
      y: 0,
    };

    const colors = {
      line: "rgba(150, 163, 184, 0.18)",
      node: "rgba(0, 188, 125, 0.26)",
      glow: "rgba(0, 188, 125, 0.24)",
    };

    const readTheme = () => {
      const styles = getComputedStyle(heroStage);
      const isDarkTheme = document.documentElement.classList.contains("dark");
      colors.line = withAlpha(
        styles.getPropertyValue("--border").trim() || "#cbd5e1",
        isDarkTheme ? 0.18 : 0.34,
      );
      colors.node = withAlpha(
        styles.getPropertyValue("--primary").trim() || "#00bc7d",
        isDarkTheme ? 0.2 : 0.38,
      );
      colors.glow = withAlpha(
        styles.getPropertyValue("--primary").trim() || "#00bc7d",
        isDarkTheme ? 0.1 : 0.18,
      );
    };

    const createPoints = () => {
      columns = Math.ceil(width / meshSpacing) + 2;
      rows = Math.ceil(height / meshSpacing) + 2;
      points = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          points.push({
            anchorX: col * meshSpacing - meshSpacing / 2,
            anchorY: row * meshSpacing - meshSpacing / 2,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
            driftPhaseX: row * 0.34 + col * 0.21,
            driftPhaseY: row * 0.18 + col * 0.37,
          });
        }
      }
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      readTheme();
      createPoints();
    };

    const positionFor = (point: MeshPoint, now: number) => {
      const driftX = Math.sin(now * 0.00052 + point.driftPhaseX) * meshAmplitude;
      const driftY = Math.cos(now * 0.00046 + point.driftPhaseY) * meshAmplitude * 0.84;

      return {
        x: point.anchorX + driftX + point.offsetX,
        y: point.anchorY + driftY + point.offsetY,
      };
    };

    const updatePhysics = () => {
      for (const point of points) {
        let targetX = 0;
        let targetY = 0;

        if (pointer.active) {
          const deltaX = pointer.x - point.anchorX;
          const deltaY = pointer.y - point.anchorY;
          const distance = Math.hypot(deltaX, deltaY);

          if (distance < meshInfluenceRadius) {
            const influence = (1 - distance / meshInfluenceRadius) ** 2;
            targetX = deltaX * 0.22 * influence;
            targetY = deltaY * 0.22 * influence;
          }
        }

        point.velocityX += (targetX - point.offsetX) * meshSpring;
        point.velocityY += (targetY - point.offsetY) * meshSpring;
        point.velocityX *= meshDamping;
        point.velocityY *= meshDamping;
        point.offsetX += point.velocityX;
        point.offsetY += point.velocityY;
      }
    };

    const draw = (now: number) => {
      updatePhysics();
      context.clearRect(0, 0, width, height);

      const positions = points.map((point) => positionFor(point, now));

      context.lineWidth = 1;
      context.strokeStyle = colors.line;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const index = row * columns + col;
          const current = positions[index];

          if (!current) {
            continue;
          }

          if (col < columns - 1) {
            const right = positions[index + 1];
            if (right) {
              context.beginPath();
              context.moveTo(current.x, current.y);
              context.lineTo(right.x, right.y);
              context.stroke();
            }
          }

          if (row < rows - 1) {
            const below = positions[index + columns];
            if (below) {
              context.beginPath();
              context.moveTo(current.x, current.y);
              context.lineTo(below.x, below.y);
              context.stroke();
            }
          }
        }
      }

      context.fillStyle = colors.node;
      for (const current of positions) {
        context.beginPath();
        context.arc(current.x, current.y, 1.1, 0, Math.PI * 2);
        context.fill();
      }

      if (pointer.active) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          meshInfluenceRadius,
        );
        glow.addColorStop(0, colors.glow);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, meshInfluenceRadius, 0, Math.PI * 2);
        context.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.active = true;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const mutationObserver = new MutationObserver(readTheme);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    heroStage.addEventListener("pointermove", handlePointerMove, { passive: true });
    heroStage.addEventListener("pointerleave", handlePointerLeave);
    heroStage.addEventListener("pointercancel", handlePointerLeave);

    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      heroStage.removeEventListener("pointermove", handlePointerMove);
      heroStage.removeEventListener("pointerleave", handlePointerLeave);
      heroStage.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, []);

  return (
    <div className={cn("hero-mesh", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="hero-mesh__canvas" />
    </div>
  );
}

function withAlpha(colorValue: string, alpha: number) {
  const rgb = parseCssColor(colorValue);

  if (!rgb) {
    return `rgba(0, 188, 125, ${alpha})`;
  }

  const { r, g, b } = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseCssColor(colorValue: string) {
  const color = colorValue.trim();

  if (!color) {
    return null;
  }

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((part) => `${part}${part}`)
            .join("")
        : hex.slice(0, 6);

    if (normalized.length !== 6) {
      return null;
    }

    const numeric = Number.parseInt(normalized, 16);
    return {
      r: (numeric >> 16) & 255,
      g: (numeric >> 8) & 255,
      b: numeric & 255,
    };
  }

  const matched = color.match(/\d+(\.\d+)?/g);

  if (!matched || matched.length < 3) {
    return null;
  }

  return {
    r: Number(matched[0]),
    g: Number(matched[1]),
    b: Number(matched[2]),
  };
}
