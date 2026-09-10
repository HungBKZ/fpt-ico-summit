"use client";

import { useEffect, useId, useRef, useState } from "react";

interface InfoTooltipProps {
  text: string;
  side?: "top" | "bottom" | "left" | "right";
}

const sideClasses: Record<NonNullable<InfoTooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const alignRightClasses: Record<NonNullable<InfoTooltipProps["side"]>, string> = {
  top: "bottom-full right-0 left-auto translate-x-0 mb-2",
  bottom: "top-full right-0 left-auto translate-x-0 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function InfoTooltip({ text, side = "bottom" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || (side !== "top" && side !== "bottom")) return;
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const overflowsRight = rect.left + 230 > window.innerWidth - 8;
    setAlignRight(overflowsRight);
  }, [open, side]);

  const positionClasses =
    alignRight && (side === "top" || side === "bottom") ? alignRightClasses[side] : sideClasses[side];

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-label={text}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold leading-none text-slate-600 transition hover:bg-slate-300 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        i
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 w-max max-w-[230px] rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-medium leading-snug text-white shadow-lg ${positionClasses}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
