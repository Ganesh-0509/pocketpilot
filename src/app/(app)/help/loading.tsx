import { Skeleton } from '@/components/ui/skeleton';

export default function HelpLoading() {
  return (
    <div className="space-y-6 p-4 safe-pb">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Search/filter */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* FAQ sections */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
