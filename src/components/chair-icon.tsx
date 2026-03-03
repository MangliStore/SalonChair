import React from 'react';

export function ChairIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Backrest on the right side */}
      <path d="M18 4v12" />
      {/* Seat extending left towards the text */}
      <path d="M18 12H8a2 2 0 0 0-2 2v1" />
      {/* Armrest */}
      <path d="M18 9H11" />
      {/* Hydraulic Base silhouette */}
      <path d="M13 17v4" />
      <path d="M9 21h8" />
    </svg>
  );
}
