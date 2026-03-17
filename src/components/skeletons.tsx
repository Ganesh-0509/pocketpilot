/**
 * @fileOverview PocketPilot Loading Skeletons
 * 
 * Skeleton loading components for smooth data fetching UX.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// ============================================================================
// HERO SKELETON
// ============================================================================

export function HeroCardSkeleton() {
  return (
    <Card className="w-full bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100 p-8 mb-6">
      <div className="text-center space-y-4">
        {/* Icon placeholder */}
        <Skeleton className="h-12 w-12 mx-auto rounded-full" />

        {/* Title */}
        <Skeleton className="h-6 w-48 mx-auto" />

        {/* Large number */}
        <Skeleton className="h-16 w-48 mx-auto" />

        {/* Status text */}
        <Skeleton className="h-4 w-64 mx-auto" />

        {/* Badge */}
        <Skeleton className="h-6 w-32 mx-auto rounded-full" />
      </div>
    </Card>
  );
}

// ============================================================================
// STATS ROW SKELETON (3 Cards)
// ============================================================================

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1 */}
      <Card className="p-4 border-gray-200">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>

      {/* Card 2 */}
      <Card className="p-4 border-gray-200">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>

      {/* Card 3 */}
      <Card className="p-4 border-gray-200">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>
    </div>
  );
}

// ============================================================================
// EXPENSE LIST SKELETON (5 Rows)
// ============================================================================

export function ExpenseListSkeleton() {
  return (
    <Card className="p-4 border-gray-200">
      <Skeleton className="h-6 w-32 mb-4" />

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            {/* Icon + Text */}
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Amount */}
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// LIABILITIES LIST SKELETON
// ============================================================================

export function LiabilitiesListSkeleton() {
  return (
    <Card className="p-4 border-gray-200">
      <Skeleton className="h-6 w-40 mb-4" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// BURN RATE CHART SKELETON
// ============================================================================

export function BurnRateChartSkeleton() {
  return (
    <Card className="p-4 border-gray-200 mb-6">
      <Skeleton className="h-6 w-32 mb-4" />

      {/* Chart placeholder */}
      <div className="h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex items-end justify-between h-full gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 flex items-end justify-center">
              <Skeleton
                className="w-full rounded-t"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// FULL DASHBOARD SKELETON
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Hero */}
      <HeroCardSkeleton />

      {/* Stats Row */}
      <StatsRowSkeleton />

      {/* Burn Rate Chart */}
      <BurnRateChartSkeleton />

      {/* Expense List */}
      <ExpenseListSkeleton />
    </div>
  );
}

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <p className="text-sm text-amber-800">
          <strong>Offline </strong>— Expenses will sync when reconnected
        </p>
      </div>
    </div>
  );
}
