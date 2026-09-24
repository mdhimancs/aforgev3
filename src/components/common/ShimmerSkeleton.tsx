import React from 'react';

interface ShimmerSkeletonProps {
  className?: string;
  count?: number;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  className = 'h-4 w-full rounded-md',
  count = 1
}) => {
  if (count === 1) {
    return <div className={`animate-shimmer ${className}`} />;
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-shimmer ${className}`} />
      ))}
    </div>
  );
};

export const ArticleLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6">
      {/* Badges skeleton */}
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full animate-shimmer" />
        <div className="h-6 w-32 rounded-full animate-shimmer" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg animate-shimmer" />
        <div className="h-8 w-1/2 rounded-lg animate-shimmer" />
      </div>

      {/* Meta skeleton */}
      <div className="flex gap-4 pb-6 border-b border-slate-100">
        <div className="h-4 w-24 rounded animate-shimmer" />
        <div className="h-4 w-28 rounded animate-shimmer" />
      </div>

      {/* Paragraph blocks skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-5/6 rounded animate-shimmer" />
      </div>

      {/* Architecture diagram placeholder */}
      <div className="h-48 w-full rounded-xl animate-shimmer" />

      {/* More paragraphs */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-11/12 rounded animate-shimmer" />
        <div className="h-4 w-4/6 rounded animate-shimmer" />
      </div>
    </div>
  );
};
