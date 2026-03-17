import { Skeleton } from '@/components/ui/skeleton';

export default function CheckInLoading() {
  return (
    <div className="space-y-6 p-4 safe-pb">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" /> {/* Amount */}
        <Skeleton className="h-12 w-full rounded-lg" /> {/* Category */}
        <Skeleton className="h-24 w-full rounded-lg" /> {/* Notes */}
        <Skeleton className="h-12 w-full rounded-lg" /> {/* Submit button */}
      </div>

      {/* Recent transactions */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
