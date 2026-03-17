'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import type { SemesterLiability } from '@/lib/dailyEngine';

interface ExtendedLiability extends SemesterLiability {
  title?: string;
}

interface UpcomingLiabilitiesSectionProps {
  liabilities: ExtendedLiability[];
  dailyLimit: number;
}

export function UpcomingLiabilitiesSection({
  liabilities,
  dailyLimit,
}: UpcomingLiabilitiesSectionProps) {
  const totalLiability = liabilities.reduce((sum, l) => sum + l.amount, 0);

  return (
    <Card className="border-orange-200/30 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Upcoming Liabilities (Next 14 Days)
        </CardTitle>
        <CardDescription>
          Total: ₹{totalLiability.toFixed(0)} ({(totalLiability / dailyLimit).toFixed(1)} days of budget)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liabilities.map((liability) => (
            <div
              key={liability.id}
              className="flex items-start justify-between rounded-lg border border-orange-100 bg-orange-50/30 p-3"
            >
              <div>
                <p className="font-medium text-sm">{liability.title || 'Liability'}</p>
                <p className="text-xs text-muted-foreground">
                  {format(liability.dueDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">₹{liability.amount.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  {(liability.amount / dailyLimit).toFixed(1)} days
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
