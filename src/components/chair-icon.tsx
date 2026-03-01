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
      <path d="M7 18V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v13" />
      <path d="M5 18h14" />
      <path d="M19 13H5" />
      <path d="M15 18v3" />
      <path d="M9 18v3" />
    </svg>
  );
}
