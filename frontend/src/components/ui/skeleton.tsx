interface Props {
  className?: string;
}

export default function Skeleton({ className = '' }: Props) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export function SkeletonCard({ className = '' }: Props) {
  return (
    <div className={`glass-card p-6 rounded-2xl border border-white/10 space-y-4 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonChart({ className = '' }: Props) {
  return (
    <div className={`glass-card p-6 rounded-2xl border border-white/10 ${className}`}>
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
