'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DailySummary } from '@/lib/dailyEngine';

interface HeroCardProps {
  safeDailyLimit: number;
  todaySpend: number;
  burnRateStatus: DailySummary['burnRateStatus'];
}

export function HeroCard({
  safeDailyLimit,
  todaySpend,
  burnRateStatus,
}: HeroCardProps) {
  const safeToSpend = Math.max(0, safeDailyLimit - todaySpend);
  const progressPercentage = (todaySpend / safeDailyLimit) * 100;

  // Determine color based on burn rate status
  const isSurvival = burnRateStatus === 'critical';
  const isWarning = burnRateStatus === 'warning';
  const mainColorClass = isSurvival
    ? 'text-red-600'
    : isWarning
      ? 'text-amber-600'
      : 'text-teal-600';

  const borderClass = isSurvival
    ? 'border-red-200/30 bg-gradient-to-br from-red-50/50'
    : isWarning
      ? 'border-amber-200/30 bg-gradient-to-br from-amber-50/50'
      : 'border-teal-200/30 bg-gradient-to-br from-teal-50/50';

  return (
    <Card className={`${borderClass} via-background to-background shadow-sm`}>
      <CardContent className="pt-8">
        <div className="space-y-4 text-center">
          {/* Main Number */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Safe to Spend Today
            </p>
            <div className={`mt-2 text-5xl font-bold ${mainColorClass} md:text-6xl`}>
              ₹{safeToSpend.toFixed(0)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={Math.min(progressPercentage, 100)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              ₹{todaySpend.toFixed(0)} spent of ₹{safeDailyLimit.toFixed(0)} limit
            </p>
          </div>

          {/* Status Badge */}
          {todaySpend > safeDailyLimit && (
            <div className="rounded-lg border border-red-200/50 bg-red-50 px-3 py-2">
              <p className="text-xs font-semibold text-red-700">
                ₹{(todaySpend - safeDailyLimit).toFixed(0)} over limit
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
