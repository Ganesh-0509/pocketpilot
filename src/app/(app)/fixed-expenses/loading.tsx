import { Skeleton } from '@/components/ui/skeleton';

export default function FixedExpensesLoading() {
  return (
    <div className="space-y-6 p-4 safe-pb">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Add button */}
      <Skeleton className="h-10 w-32 rounded-lg" />

      {/* Fixed expenses list */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>

      {/* Summary box */}
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
