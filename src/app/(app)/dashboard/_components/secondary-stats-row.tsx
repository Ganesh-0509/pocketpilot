'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Calendar, TrendingDown } from 'lucide-react';

interface SecondaryStatsRowProps {
  remainingBudget: number;
  daysRemaining: number;
  monthEndPredictionDay: number | null;
}

export function SecondaryStatsRow({
  remainingBudget,
  daysRemaining,
  monthEndPredictionDay,
}: SecondaryStatsRowProps) {
  const isRunoutRisk = monthEndPredictionDay !== null;
  const today = new Date().getDate();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {/* Remaining This Month */}
      <Card className="shadow-sm">
        <CardContent className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Remaining
          </p>
          <p className="mt-2 text-2xl font-bold text-teal-600">
            ₹{remainingBudget.toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            After upcoming liabilities
          </p>
        </CardContent>
      </Card>

      {/* Days Left */}
      <Card className="shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Days Left
              </p>
              <p className="mt-2 text-2xl font-bold">{daysRemaining}</p>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Month-End Prediction */}
      <Card
        className={`shadow-sm ${
          isRunoutRisk ? 'border-red-200/50 bg-red-50' : ''
        }`}
      >
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              {isRunoutRisk ? (
                <p className="mt-2 text-sm font-bold text-red-700">
                  Runs out Day {monthEndPredictionDay}
                </p>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xl">✓</span>
                  <span className="text-sm font-bold text-green-700">On track</span>
                </div>
              )}
            </div>
            {isRunoutRisk && (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
