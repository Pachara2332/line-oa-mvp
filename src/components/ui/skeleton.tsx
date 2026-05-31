import React from "react";

export function Skeleton({
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/60 dark:bg-gray-800/60 ${className}`}
    />
  );
}
