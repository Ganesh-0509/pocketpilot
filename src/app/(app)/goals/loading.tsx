import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsLoading() {
  return (
    <div className="space-y-6 p-4 safe-pb">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Add goal button */}
      <Skeleton className="h-10 w-32 rounded-lg" />

      {/* Goals list */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
