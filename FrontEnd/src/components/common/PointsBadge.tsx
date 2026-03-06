import { Coins } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
}

export function PointsBadge({ points, size = "md" }: PointsBadgeProps) {
  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={`inline-flex items-center font-medium text-yellow-600 ${sizeClasses[size]}`}>
      <Coins className={iconSize[size]} />
      <span>{points.toLocaleString("vi-VN")} điểm</span>
    </div>
  );
}
