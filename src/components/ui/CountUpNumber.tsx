"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpNumberProps {
  value: number;
  duration?: number;
  className?: string;
  ariaLabel?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUpNumber({
  value,
  duration = 900,
  className,
  ariaLabel,
  prefix = "",
  suffix = "",
}: CountUpNumberProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [current, setCurrent] = useState(() =>
    prefersReducedMotion ? value : 0,
  );
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    let frameId = 0;
    const start = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(value * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frameId = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [duration, prefersReducedMotion, value]);

  const displayValue = Math.round(prefersReducedMotion ? value : current);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
