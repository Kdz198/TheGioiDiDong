"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export type SortDirection = "asc" | "desc" | "none";

interface SortButtonProps extends Omit<React.ComponentProps<typeof Button>, "onChange"> {
  onChange?: (direction: SortDirection) => void;
  direction?: SortDirection;
  children?: React.ReactNode;
}

const CustomSortIcon = ({ direction }: { direction?: SortDirection }) => {
  const isActive = direction !== "none" && direction !== undefined;
  const upActive = direction === "asc";
  const downActive = direction === "desc";

  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor">
      <path
        d="M5 7 L8 3 L11 7 Z"
        className={cn(
          "transition-opacity",
          upActive ? "opacity-100" : isActive ? "opacity-25" : "opacity-40"
        )}
      />
      <path
        d="M5 9 L8 13 L11 9 Z"
        className={cn(
          "transition-opacity",
          downActive ? "opacity-100" : isActive ? "opacity-25" : "opacity-40"
        )}
      />
    </svg>
  );
};

const getNextDirection = (current: SortDirection): SortDirection => {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
};

export function SortButton({
  onChange,
  direction = "none",
  children,
  className,
  ...props
}: SortButtonProps) {
  const isActive = direction !== "none";

  const handleClick = () => {
    const newDirection = getNextDirection(direction);
    onChange?.(newDirection);
  };

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      className={cn(
        "h-8 gap-1.5 px-2 font-medium whitespace-nowrap",
        isActive
          ? "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "text-gray-500 hover:bg-gray-100 hover:text-zinc-700",
        className
      )}
      onClick={handleClick}
      {...props}>
      <span>{children}</span>
      <CustomSortIcon direction={direction} />
    </Button>
  );
}
