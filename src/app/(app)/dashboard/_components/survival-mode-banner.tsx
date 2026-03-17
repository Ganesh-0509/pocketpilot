'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface SurvivalModeBannerProps {
  dailyLimit: number;
  daysRemaining: number;
}

export function SurvivalModeBanner({
  dailyLimit,
  daysRemaining,
}: SurvivalModeBannerProps) {
  return (
    <Link href="/semester-planner">
      <div className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 p-4 transition-colors hover:bg-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-bold text-red-700">
              Survival Mode — ₹{dailyLimit.toFixed(0)}/day for {daysRemaining} days remaining.
            </p>
            <p className="mt-1 text-sm text-red-600">Spend carefully.</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
