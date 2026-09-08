"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible star rating.
 *
 * Display mode: `value` renders a read-only rating with a text label for
 * screen readers (state is never communicated by stars alone).
 *
 * Input mode: `onChange` renders a keyboard-operable selector (↑/↓ to move,
 * Enter to select, R to clear).
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const interactive = Boolean(onChange);
  const [hover, setHover] = React.useState<number | null>(null);
  const displayed = hover ?? value;

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  } as const;

  const iconSize = sizes[size];

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!onChange) return;
      let next = value;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(5, value + 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(1, value - 1);
      else if (event.key === "Home") next = 1;
      else if (event.key === "End") next = 5;
      else if (event.key === "r" || event.key === "R") next = 0;
      else return;
      event.preventDefault();
      onChange(next);
    },
    [value, onChange]
  );

  if (!interactive) {
    return (
      <span
        className={cn("inline-flex items-center gap-0.5", className)}
        role="img"
        aria-label={`Rated ${value} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(iconSize, i < Math.round(value) ? "fill-warning text-warning" : "fill-muted text-muted")}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div
        role="radiogroup"
        aria-label="Rating"
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-1"
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const selected = displayed >= starValue;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(starValue)}
              onBlur={() => setHover(null)}
              className={cn(
                "rounded-sm p-0.5 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted hover:fill-warning/50 hover:text-warning/50"
              )}
            >
              <Star className={iconSize} aria-hidden="true" strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {value > 0 ? `Selected ${value} out of 5 stars` : "No rating selected"}
      </span>
    </div>
  );
}