'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function SemesterPlannerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold">Failed to load semester planner</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn't retrieve your semester liabilities. Please try again.
          </p>
        </div>

        <Button onClick={reset} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  );
}
