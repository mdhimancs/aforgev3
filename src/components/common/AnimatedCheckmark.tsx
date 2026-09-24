import React from 'react';

interface AnimatedCheckmarkProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  size = 24,
  className = 'text-emerald-500',
  strokeWidth = 3
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className="animate-draw-check stroke-current opacity-30"
      />
      <path
        d="M8 12.5l2.5 2.5L16 9"
        className="animate-draw-check stroke-current font-bold"
      />
    </svg>
  );
};
