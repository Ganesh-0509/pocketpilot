'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface TopImpactCardProps {
  totalUpcomingLiabilities: number;
  dailyLimitWithout: number;
  dailyLimitWith: number;
  impact: number;
}

export function TopImpactCard({
  totalUpcomingLiabilities,
  dailyLimitWithout,
  dailyLimitWith,
  impact,
}: TopImpactCardProps) {
  const reduction = dailyLimitWithout - dailyLimitWith;
  const reductionPercent = dailyLimitWithout > 0 ? (reduction / dailyLimitWithout) * 100 : 0;

  return (
    <Card className="border-teal-200/30 bg-gradient-to-br from-teal-50/50 via-background to-background shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Main Impact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Total Upcoming Costs (Next 30 Days)
            </p>
            <div className="mt-2 text-4xl font-bold text-teal-600">
              ₹{totalUpcomingLiabilities.toFixed(0)}
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="rounded-lg border border-teal-200/50 bg-teal-50/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Impact on Daily Limit
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Without planning</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ₹{dailyLimitWithout.toFixed(0)}/day
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">With planning</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  ₹{dailyLimitWith.toFixed(0)}/day
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              ₹{impact.toFixed(0)} is being held back from your daily limit to cover upcoming costs.
              This protects you from accidentally spending money you'll need soon.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
