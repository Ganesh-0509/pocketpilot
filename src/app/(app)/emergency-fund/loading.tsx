import { Skeleton } from '@/components/ui/skeleton';

export default function EmergencyFundLoading() {
  return (
    <div className="space-y-6 p-4 safe-pb">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Fund balance card */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Deposit/Withdraw buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      {/* Transactions list */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
