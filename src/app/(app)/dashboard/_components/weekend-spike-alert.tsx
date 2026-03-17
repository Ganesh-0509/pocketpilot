'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface WeekendSpikeAlertProps {
  spikeFactor: number;
}

export function WeekendSpikeAlert({ spikeFactor }: WeekendSpikeAlertProps) {
  return (
    <Card className="border-amber-200/50 bg-amber-50 shadow-sm">
      <CardContent className="flex items-start gap-3 pt-4">
        <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-700">
            Weekend spending is {spikeFactor.toFixed(1)}× your weekday average
          </p>
          <p className="mt-1 text-sm text-amber-600">
            Keep discretionary plans tighter this weekend.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
