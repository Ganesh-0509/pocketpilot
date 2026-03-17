'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BurnRateChartProps {
  data: Array<{
    date: string;
    amount: number;
  }>;
  dailyLimit: number;
}

export function BurnRateChart({ data, dailyLimit }: BurnRateChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Burn Rate (Last 7 Days)</CardTitle>
        <CardDescription>
          Daily spend vs. your current daily limit (₹{dailyLimit.toFixed(0)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
              formatter={(value: number) => `₹${value.toFixed(0)}`}
              labelStyle={{ color: 'var(--color-foreground)' }}
            />
            {/* Reference line for daily limit */}
            <ReferenceLine
              y={dailyLimit}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="5 5"
              label={{
                value: `Limit: ₹${dailyLimit.toFixed(0)}`,
                position: 'right',
                fill: 'var(--color-muted-foreground)',
                fontSize: 12,
              }}
            />
            {/* Actual spend line */}
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Daily Spend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
